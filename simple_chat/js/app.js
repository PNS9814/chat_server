if (typeof HOST === "undefined" || HOST === "") {
    alert("HOSTをenv.jsで設定してください");
}

// DOM要素取得
const form = document.getElementById("chatForm");
const input = document.getElementById("msgInput");
const chatBox = document.getElementById("chatBox");
const langSelect = document.getElementById("langSelect");
const sendBtn = document.getElementById("sendBtn");

// TODO:サーバーに接続: HOST, transports: ["websocket"]
const socket = io(HOST, { transports: ["websocket"] });

// 固定ルーム（簡易）
const roomId = "room1";
const userName = "User" + Math.floor(Math.random() * 1000);

// 接続時
socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
    socket.name = userName;
    socket.emit("join_room", {roomId, userName});
    append(t('you_joined', {user: userName}));
});

// JOINメッセージ受信
socket.on("join_message", (data) => {
    console.log(data)
    // If server sent a translation key, translate on client
    if (data.key) {
        append(t(data.key, data.params || {}));
    } else if (data.text) {
        append(data.text);
    }
});

// メッセージ受信
// chat_message 受信
socket.on("chat_message", async (data) => {
    const text = data.text;
    const sender = data.userName || "Unknown";

    console.log(data);
    // 画面に表示
    append(`🔵 ${sender}: ${text}`);

    // 受信したメッセージを翻訳サーバに送る場合
    const translateData = {
        text,
        roomId: data.roomId,
        fromLang: "ja", // 元の言語
        toLang: "en",   // 翻訳先言語
        userName: sender
    };

    console.log(translateData);
    // サーバーに翻訳依頼
    socket.emit("translate", translateData);
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
    socket.emit("send_message", { text, roomId, userName });

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

// Language selector: when changed, load translations and update static labels
if (typeof i18n !== 'undefined') {
    // Initialize language from localStorage or default to 'ja'
    const saved = localStorage.getItem('lang') || 'ja';
    i18n.load(saved).then(() => {
        applyStaticTranslations();
    });

    if (langSelect) {
        langSelect.value = saved;
        langSelect.addEventListener('change', async (e) => {
            const v = e.target.value;
            await i18n.load(v);
            localStorage.setItem('lang', v);
            applyStaticTranslations();
        });
    }
}

function applyStaticTranslations() {
    // data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });
    // send button
    if (sendBtn) sendBtn.textContent = t('send_button');
}