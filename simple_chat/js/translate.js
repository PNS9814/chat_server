if (typeof HOST === "undefined" || HOST === "") {
    alert("HOSTをenv.jsで設定してください");
}

// DOM要素取得
const form = document.getElementById("chatForm");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messageBox = document.getElementById("message-box");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // 入力値取得
    const text = input.value.trim();
    console.log(text);
    if (!text) return;

    // 自分のチャットログに表示
    append(`🟢 ${text}`);

    const fromLang = "ja"; // 元の言語
    const toLang = "si";   // 翻訳先言語
    const url = `${HOST}/translate`;
    const data = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, fromLang, toLang })
    });
    const result = await data.json();
    console.log(result);

    // 入力欄クリア
    input.value = "";
});

function append(msg) {
    const div = document.createElement("div");
    const textDiv = document.createElement("div");
    textDiv.textContent = msg;
    div.appendChild(textDiv);
    messageBox.appendChild(div);
}