// WebSocket 연결 설정
let socket = new WebSocket("ws://localhost:8000/ws");

// 텍스트 박스 복귀 타이머
let resetTimer;

socket.onmessage = function(event) {
    const data = event.data;

    // 볼륨 데이터 처리
    if (data.startsWith("volume:")) {
        const volume = parseInt(data.split(":")[1], 10);
        const volumeDisplay = document.getElementById("volume-display");
        volumeDisplay.textContent = "Volume: " + volume + "%";

        const volumeBar = document.getElementById("volume-bar");
        volumeBar.style.width = volume + "%";

        const transcription = document.getElementById("transcription");

        if (volume >= 20) {
            transcription.classList.add("active");

            // 복귀 타이머 리셋
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                transcription.classList.remove("active"); // 일정 시간 후 원래 스타일로 복귀
            }, 1000); // 2초 후 복귀
        } 
    } 
    // 음성 인식 텍스트 처리
    else if (data.startsWith("text:")) {
        const text = data.split(":")[1];
        const transcription = document.getElementById("transcription");
        transcription.value += text + "\n";
        transcription.scrollTop = transcription.scrollHeight;
    }
};

// WebSocket 연결 성공
socket.onopen = function() {
    console.log("WebSocket connected");
};

// WebSocket 연결 종료
socket.onclose = function() {
    console.log("WebSocket disconnected");
    const transcription = document.getElementById("transcription");
    transcription.classList.remove("active"); // 연결 종료 시 스타일 초기화
};
