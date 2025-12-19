// WebSocket
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { GoogleGenAI } from "@google/genai";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const TTS_PATH = process.env.TTS_PATH || "tts-cache/";

let voiceId = "";

const langs = {
    'ja': { 'label': 'Japanese', 'voice': "bqpOyYNUu11tjjvRUbKn" },
    'en': { 'label': 'English', 'voice': "21m00Tcm4TlvDq8ikWAM" },
    'es': { 'label': 'Spanish', 'voice': "" },
    'de': { 'label': 'German', 'voice': "" },
    'fr': { 'label': 'French', 'voice': "kwhMCf63M8O3rCfnQ3oQ" },
    'bn': { 'label': 'Bengali', 'voice': "WiaIVvI1gDL4vT4y7qUU" },
    'zh': { 'label': 'Chinese', 'voice': "" },
    'vi': { 'label': 'Vietnamese', 'voice': "" },
    'si': { 'label': 'Sinhala', 'voice': "" },
    'id': { 'label': 'Bahasa Indonesia', 'voice': "4h05pJAlcSqTMs5KRd8X" },
    'ne': { 'label': 'Nepali', 'voice': "" },
    'mn': { 'label': 'Mongolian', 'voice': "" },
    'my': { 'label': 'Burmese', 'voice': "" },
};

// ==============================
// 🔥 Express for REST API
// ==============================
const app = express();
app.use(express.json());
app.use(cors());

// public フォルダを公開
app.use(express.static("public"));

// ==============================
// ✅ Gemini 設定
// ==============================
const modelName = "gemini-2.0-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ==============================
// 翻訳API: /translate
// ==============================
app.post("/api/translate", async (req, res) => {
    const { text, fromLang, toLang } = req.body;

    if (!text || !fromLang || !toLang) {
        return res.status(400).json({
            error: "text, fromLang, and toLang are required.",
        });
    }
    try {
        const translatedText = await aiTranslate(text, fromLang, toLang);
        console.log("🌐 Translated:", translatedText);
        res.json({ text, translatedText, fromLang, toLang });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "translated error" });
    }
});


// ------------------------------
// HTTPサーバーを起動
// ------------------------------
const httpServer = app.listen(PORT, () => {
    console.log(`✅ Translate API ready : http://${HOST}:${PORT}`);
});

// ==============================
// Socket.IO (HTTPサーバーに乗せる)
// ==============================
const io = new Server(httpServer, {
    cors: { origin: "*" },
});

// ==============================
// WebSocket本体
// ==============================
io.on("connection", (socket) => {
    console.log("🟢 New connection:", socket.id);

    socket.on("join_room", ({ roomId, userName }) => {
        console.log(`➡️ ${userName} joining room:`, roomId);
        socket.join(roomId);
        socket.name = userName;

        // 参加メッセージをルームに通知
        socket.to(roomId).emit("join_message", {
            sender: "system",
            text: `${userName} joined the room.`,
        });
    });

    socket.on("send_message", ({ text, roomId, sender, lang }) => {
        if (!roomId) {
            socket.emit("error_message", "⚠️ Room is not connected.");
            return;
        }
        console.log(`💬 Message from ${sender}:`, text);
        socket.to(roomId).emit("chat_message", { sender, text, lang });
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Disconnected: ${socket.name ?? socket.id}`);
    });
});

export async function aiTranslate(text, fromLang, toLang) {
    if (!text || typeof text !== "string") {
        return null;
    }

    console.log("Translate:", text, fromLang, "→", toLang);

    // 最大文字数制限（サーバー負荷保護）
    if (text.length > 100) {
        return null;
    }
    const fromLangLabel = langs[fromLang]?.label || "";
    const toLangLabel = langs[toLang]?.label || "";
    if (!fromLangLabel || !toLangLabel) {
        return
    }

    try {
        const prompt = `
            Translate text from ${fromLangLabel} to ${toLangLabel}.
            Only output the translated text.
            No explanations.
            
            ${text}`;

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: modelName,
            config: { maxOutputTokens: 512 },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const result =
            response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!result) throw "Empty result";
        return result;

    } catch (err) {
        console.error("[AI翻訳失敗]", err);
        return null;
    }
}

// ==============================
// ElevenLabs TTS API
// ==============================
app.post("/api/tts", async (req, res) => {
    const { text, lang } = req.body;
    const voiceId = langs[lang]?.voice;

    if (!text || !lang || !voiceId) {
        return res.status(400).json({
            error: "text, lang, and voiceId are required.",
        });
    }

    // --- 追加: ディレクトリの存在チェックと作成 ---
    const localTTSPath = "./public/" + TTS_PATH;
    if (!fs.existsSync(localTTSPath)) {
        fs.mkdirSync(localTTSPath, { recursive: true });
    }

    // ハッシュ生成（text+lang）
    const hash = crypto.createHash("md5").update(text + lang).digest("hex");
    const fileName = `${hash}.mp3`;
    const localTTSFolder = "./public/" + TTS_PATH;
    const localTTSFilePath = localTTSFolder + fileName;
    const audioUrl = `http://${HOST}:${PORT}/${TTS_PATH}${fileName}`;
    console.log("Audio URL:", audioUrl);
    console.log("Local TTS Path:", localTTSFilePath);

    // ✅ もしファイルが存在したらキャッシュ返却
    if (fs.existsSync(localTTSFilePath)) {
        console.log("🟠 Cache hit:", localTTSFilePath);

        return res.json({
            message: "TTS audio cached.",
            audioUrl,
            fileName,
        });
    }

    console.log("🟢 Cache miss → ElevenLabs API");

    // ===========================
    //  ElevenLabs API 呼び出し
    // ===========================
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "xi-api-key": process.env.ELEVEN_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.3,
                similarity_boost: 0.8
            }
        })
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ サーバーに保存（キャッシュ登録）
    fs.writeFileSync(localTTSFilePath, buffer);
    console.log("✅ TTS audio saved:", localTTSFilePath, audioUrl);

    // レスポンス返却
    // res.setHeader("Content-Type", "audio/mpeg");
    // res.send(buffer);
    return res.json({
        message: "TTS audio generated.",
        audioUrl,
        fileName,
    });
});