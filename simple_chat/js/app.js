// ================================
// 環境チェック
// ================================
if (typeof HOST === "undefined" || HOST === "") {
    alert("HOSTをenv.jsで設定してください");
}

// ================================
// DOM要素取得
// ================================
const form = document.getElementById("chatForm");
const input = document.getElementById("msgInput");
const chatBox = document.getElementById("chatBox");
const langSelect = document.getElementById("langSelect");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

// ================================
// サーバー接続
// ================================
const socket = io(HOST, { transports: ["websocket"] });
const roomId = "room1";
const userName = "User" + Math.floor(Math.random() * 1000);

// 接続時
socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
    socket.name = userName;
    socket.emit("join_room", { roomId, userName });
    append(`${userName} が参加しました`);
});

// ================================
// メッセージ受信
// ================================
socket.on("chat_message", async (data) => {
    const { text, sender, lang: fromLang } = data;
    append(`🔵 ${sender}: ${text}`);

    if (sender === userName) return; // 自分のメッセージは翻訳不要

    const toLang = langSelect.value;
    if (fromLang === toLang) return; // 同じ言語なら翻訳不要

    append(`🔵 翻訳中...`);

    try {
        const uri = `${HOST}/api/translate`;
        console.log("Translating via:", uri);
        const res = await fetch(uri, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, fromLang, toLang }),
        });
        const result = await res.json();
        if (result.translatedText) {
            append(`🌍 ${sender}: ${result.translatedText}`);
        } else {
            append("⚠️ 翻訳に失敗しました");
        }
    } catch (err) {
        console.error("Translation API error:", err);
        append("⚠️ 翻訳に失敗しました（ネットワークエラー）");
    }
});

// ================================
// メッセージ送信
// ================================
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    append(`🟢 ${text}`);

    const lang = langSelect.value;
    socket.emit("send_message", { text, roomId, sender: userName, lang });
    input.value = "";
});

// ================================
// 表示関数
// ================================
function append(msg) {
    const div = document.createElement("div");
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight; // 常にスクロール最下部
}

// ================================
// 🎙️ STT（音声入力）モジュール
// ================================
const STT = {
    recognition: null,
    isListening: false,
    onText: null,
    onEnd: null,

    init(lang) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("ブラウザが音声認識に対応していません（Chrome推奨）");
            return;
        }

        console.log("STT initialized with lang:", lang);
        this.recognition = new SpeechRecognition();
        this.recognition.lang = lang;
        this.recognition.interimResults = true;
        this.recognition.continuous = false;

        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (this.onText) this.onText(text);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEnd) this.onEnd();
        };
    },

    start() { if (!this.recognition) return; this.isListening = true; this.recognition.start(); },
    stop() { if (!this.recognition) return; this.recognition.stop(); this.isListening = false; }
};

// デフォルト日本語で初期化
STT.init("ja-JP");

// 音声認識結果を入力欄に反映
STT.onText = (text) => { input.value = text; };

// 音声認識終了時
STT.onEnd = () => { micBtn.textContent = "🎤"; };

// マイクボタンで STT 開始/停止
micBtn.addEventListener("click", () => {
    if (!STT.isListening) {
        // 選択中の option の data-lang を取得
        const selectedOption = langSelect.selectedOptions[0];
        const langCode = selectedOption?.dataset.lang;
        console.log("STT initialized with lang:", langCode);

        // 古いインスタンス停止
        if (STT.recognition) STT.stop();

        STT.init(langCode);
        STT.start();
        micBtn.textContent = "🎙️ 受付中...";
    } else {
        STT.stop();
        micBtn.textContent = "🎤";
    }
});


// 言語変更時にも STT 言語更新（マイク未押下時）
langSelect.addEventListener("change", () => {
    const selectedOption = langSelect.selectedOptions[0];
    const langCode = selectedOption?.dataset.lang;
    if (STT.recognition) STT.stop();
    STT.init(langCode);
    console.log("STT language set to:", langCode);
    if (!STT.isListening) micBtn.textContent = "🎤";
});
