import sounddevice as sd
import numpy as np
import asyncio
import speech_recognition as sr
import whisper
from concurrent.futures import ThreadPoolExecutor
from fastapi import WebSocket
from queue import Queue
import torch


# 볼륨 데이터를 WebSocket으로 전송
async def start_audio_stream(websocket: WebSocket):
    loop = asyncio.get_event_loop()
    executor = ThreadPoolExecutor(max_workers=1)

    def audio_callback(indata, frames, time, status):
        volume_norm = np.linalg.norm(indata) * 20  # 볼륨 크기 계산
        volume_percentage = min(volume_norm, 100)  # 0~100 사이로 정규화
        loop.run_in_executor(executor, send_volume, websocket, volume_percentage)

    def send_volume(websocket: WebSocket, volume_percentage: float):
        # 비동기로 WebSocket에 볼륨 데이터를 전송
        loop.create_task(websocket.send_text(f"volume:{int(volume_percentage)}"))

    # 오디오 입력 스트림 시작
    with sd.InputStream(callback=audio_callback):
        while True:
            await asyncio.sleep(0.1)  # 스트림 유지 및 전송 주기

# 음성 인식을 수행하고 텍스트 결과를 WebSocket으로 전송
async def start_speech_recognition(websocket: WebSocket):
    loop = asyncio.get_event_loop()
    data_queue = Queue()
    recorder = sr.Recognizer()
    source = sr.Microphone(sample_rate=16000)

    recorder.energy_threshold = 1000  # 기본 에너지 임계값 설정
    recorder.dynamic_energy_threshold = False  # 동적 보정 비활성화

    # Whisper 모델 로드
    device = "cuda" if torch.cuda.is_available() else "cpu"
    audio_model = whisper.load_model("base", device=device)

    def record_callback(_, audio: sr.AudioData):
        # 큐에 오디오 데이터 추가
        data = audio.get_raw_data()
        data_queue.put(data)

    # 백그라운드에서 녹음을 시작
    recorder.listen_in_background(source, record_callback, phrase_time_limit=3)

    while True:
        try:
            if not data_queue.empty():
                # 큐의 오디오 데이터를 결합하여 처리
                audio_data = b''.join(data_queue.queue)
                data_queue.queue.clear()

                # Whisper 입력 형식으로 변환
                audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
                result = audio_model.transcribe(audio_np, language="korean")
                text = result['text'].strip()

                # WebSocket으로 변환된 텍스트 전송
                await websocket.send_text(f"text:{text}")

            await asyncio.sleep(0.1)  # CPU 사용량을 줄이기 위해 대기
        except Exception as e:
            await websocket.send_text(f"error:{str(e)}")
            break
