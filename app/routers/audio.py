from fastapi import APIRouter, WebSocket
from app.services.audio_service import start_audio_stream, start_speech_recognition
import asyncio

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # 오디오 볼륨 스트리밍과 음성 인식을 병행 실행
    try:
        # asyncio.gather를 사용하여 두 개의 비동기 작업을 병렬로 실행
        await asyncio.gather(
            start_audio_stream(websocket),
            start_speech_recognition(websocket)
        )
    except Exception as e:
        await websocket.close(code=1000)
        print(f"WebSocket closed with error: {e}")
