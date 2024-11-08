// WebSocket 연결 설정
let socket = new WebSocket("ws://localhost:8000/ws");

// WebSocket 메시지 수신 처리
socket.onmessage = function(event) {
    const data = event.data;

    // 볼륨 데이터 처리
    if (data.startsWith("volume:")) {
        const volume = data.split(":")[1];
        const volumeDisplay = document.getElementById("volume-display");
        volumeDisplay.textContent = "Volume: " + volume + "%";

        const volumeBar = document.getElementById("volume-bar");
        volumeBar.style.width = volume + "%";
    } 
    // 음성 인식 텍스트 처리
    else if (data.startsWith("text:")) {
        const text = data.split(":")[1];
        const transcription = document.getElementById("transcription");
        transcription.value += text + "\n";
        transcription.scrollTop = transcription.scrollHeight;  // 스크롤 자동 하단 이동
    }
};

// WebSocket 연결 성공
socket.onopen = function() {
    console.log("WebSocket connected");
};

// WebSocket 연결 종료
socket.onclose = function() {
    console.log("WebSocket disconnected");
};
