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
    socket.emit("join_room", { roomId, userName });
    append(t('you_joined', { user: userName }));
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
// chat_message 受信
socket.on("chat_message", async (data) => {
    const text = data.text;
    const sender = data.sender;
    const fromLang = data.lang;

    // 表示
    append(`🔵 ${sender}: ${text}`);

    // ✅ 自分のメッセージは翻訳しない
    if (sender === userName) return;

    const toLang = document.getElementById("langSelect").value;
    if (fromLang === toLang) {
        // 同じ言語なら翻訳不要
        return;
    }

    append(`🔵 Translating...`);
    // 受信したメッセージを翻訳依頼
    const translateData = {
        text,
        fromLang: fromLang, // 元の言語
        toLang: toLang,   // 翻訳先言語
    };

    console.log("これを翻訳します", translateData);
    

    // サーバーに翻訳依頼
    try {
        // Express APIへHTTP POST
        const res = await fetch(`${HOST}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                fromLang: translateData.fromLang,
                toLang: translateData.toLang,
            }),
        });

        const result = await res.json();

        if (result.translatedText) {
            append(`🌍 ${sender}: ${result.translatedText}`);
        } else {
            append(`⚠️ 翻訳に失敗しました`);
        }
    } catch (err) {
        console.error("Translation API error:", err);
        append("⚠️ Translation failed (network error)");
    }
});

socket.on("translate", (data) => {
    console.log(data)
    append(`🌍  ${data.text}`);
});


form.addEventListener("submit", (e) => {
    e.preventDefault();
    // 入力値取得
    const text = input.value.trim();
    console.log(text);
    if (!text) return;

    // 自分のチャットログに表示
    append(`🟢 ${text}`);

    const lang = document.getElementById("langSelect").value;
    // サーバーに送信
    // text, roomId, sender, lang
    socket.emit("send_message", { text, roomId, sender: userName, lang });

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