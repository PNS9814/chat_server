if (typeof HOST === "undefined" || HOST === "") {
    alert("HOSTをenv.jsで設定してください");
}

// DOM要素取得
const form = document.getElementById("chatForm");
const input = document.getElementById("msgInput");
const chatBox = document.getElementById("chatBox");

// TODO:サーバーに接続: HOST, transports: ["websocket"]
const socket = io(HOST, { transports: ["websocket"] });

// 固定ルーム（簡易）
const roomId = "room1";
const userName = "User" + Math.floor(Math.random() * 1000);

// TODO: 接続時
socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
    socket.name = userName;
    socket.emit("join_room", {roomId, userName});
    append(`🟢 You joined : ${userName}`);
});

// JOINメッセージ受信
socket.on("join_message", (data) => {
    console.log(data)
    // 誰かが参加した場合の表示
    append(data.text);
});

// メッセージ受信
socket.on("chat_message", async (data) => {
    // メッセージ取得
    const text = data.text;
    console.log(`💬 Received message:`, text);
    append(`🔵 ${text}`);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    // 入力値取得
    const text = input.value.trim();
    console.log(text);
    if (!text) return;

    // 自分のチャットログに表示
    append(`🟢 ${text}`);

    // サーバーに送信: socket.emit("send_message") : text, roomId, myLang
    socket.emit("send_message", { text, roomId });

    // 入力欄クリア
    input.value = "";
});

// エラーメッセージ
socket.on("error_message", (msg) => append(msg, "error"));

// ==============================
// 表示関数
// ==============================
function append(msg) {
    const div = document.createElement("div");
    const textDiv = document.createElement("div");
    textDiv.textContent = msg;
    div.appendChild(textDiv);
    chatBox.appendChild(div);
}