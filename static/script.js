// WebSocket 연결 설정
let socket = new WebSocket("ws://localhost:8000/ws");

// 텍스트 박스 복귀 타이머
let resetTimer;

// 오디오 스트림 변수
let audioStream = null;
let isMicOn = false; // 마이크 상태 추적

// WebSocket 메시지 처리
socket.onmessage = function(event) {
    const data = event.data;

    if (!isMicOn) return; // 마이크가 OFF 상태일 때 데이터 무시

    if (data.startsWith("volume:")) {
        const volume = parseInt(data.split(":")[1], 10);
        const volumeDisplay = document.getElementById("volume-display");
        volumeDisplay.textContent = "Volume: " + volume + "%";

        const volumeBar = document.getElementById("volume-bar");
        volumeBar.style.width = volume + "%";

        // 텍스트 입력 박스 경계선 강조
        const userInput = document.getElementById("user-input");
        if (volume >= 20) {
            userInput.classList.add("active");

            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                userInput.classList.remove("active");
            }, 1000);
        }
    } else if (data.startsWith("text:")) {
        const text = data.split(":")[1];
        const userInput = document.getElementById("user-input");
        userInput.value = text;
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

// 마이크 On/Off 스위치 토글
async function toggleAudio() {
    const audioToggle = document.getElementById("toggle-recognition");

    if (audioToggle.checked) {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isMicOn = true; // 마이크 상태 설정
            console.log("Audio stream started");
        } catch (error) {
            console.error("Error accessing audio:", error);
            audioToggle.checked = false; // 에러 발생 시 스위치 OFF로 복구
        }
    } else {
        if (audioStream) {
            let tracks = audioStream.getTracks();
            tracks.forEach(track => track.stop()); // 오디오 스트림 중지
            console.log("Audio stream stopped");
        }
        isMicOn = false; // 마이크 상태 해제
        audioStream = null;
    }
}

function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (message) {
        addMessage("user", message);
        userInput.value = "";
    }
}

function addMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}
