// TODO: import dotenv from "dotenv"
import dotenv from 'dotenv';

// TODO: dotenv.config() を実行
dotenv.config();

// TODO: socket.ioをインポートし、Serverを取得
import { Server } from 'socket.io';

// TODO: ExpressとCORSをインポート
import express from 'express';
import cors from 'cors';

// TODO: HOSTとPORTを.envから取得、なければデフォルト値を設定
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

console.log(HOST, PORT);

// ==============================
// 🔥 Express for REST API
// ==============================
// TODO: express() を実行して app を作成
const app = express();
app.use(express.json());
app.use(cors());

// Optional REST endpoint for manual translation testing
app.post('/translate', (req, res) => {
    const { text, fromLang, toLang } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text required' });
    const translated = translateText(text, fromLang, toLang);
    res.json({ original: text, text: translated, fromLang, toLang });
});

// TODO: app.listen() でHTTPサーバーを起動し、httpServerに代入
const httpServer = app.listen(PORT, HOST, () => {
    console.log(`✅ Translate API ready : http://${HOST}:${PORT}`);
});

// TODO: CORS設定付きでSocket.IOサーバーを初期化: origin: "*"
const io = new Server(httpServer, {
    cors: { origin: "*" },
});

// WebSocket接続時の処理
io.on("connection", (socket) => {
    console.log("🟢 New connection:", socket.id);

    // join_roomイベント受信時の処理
    socket.on("join_room", ({ roomId, userName }) => {
        console.log(`➡️ ${userName} joining room:`, roomId);
        socket.join(roomId);
        socket.name = userName;

        // 参加メッセージをルームに通知
        socket.to(roomId).emit("join_message", {
            from: "system",
            text: `${socket.name} joined the room.`,
        });
    });

    // send_messageイベント受信時の処理
    socket.on("send_message", (data) => {
        const { text, roomId } = data;
        console.log(`💬 Message:`, roomId, text);
        // TODO: socket.to(roomId).emit("chat_message") : data
        socket.to(roomId).emit("chat_message", data);
    });

    // translateイベント受信時の処理
    // クライアントから翻訳を依頼されたら簡易翻訳を実行してルームに返す
    socket.on("translate", (data) => {
        try {
            const { text, roomId, fromLang, toLang, userName } = data;
            console.log(`🔁 Translate request:`, roomId, fromLang, '->', toLang, text);

            // simple mock translation function - replace with real API if available
            const translated = translateText(text, fromLang, toLang);

            // emit translated result to the whole room (including sender)
            io.to(roomId).emit("translate", {
                from: userName || socket.name || 'unknown',
                original: text,
                text: translated,
                fromLang,
                toLang,
            });
        } catch (err) {
            console.error('translate handler error', err);
            socket.emit('error_message', 'Translation failed');
        }
    });

    // WebSocket切断時の処理
    socket.on("disconnect", () => {
        console.log(`🔴 Disconnected: ${socket.id}`);
    });
});

// Simple translate function (mock)
// Replace this with real translation API integration (e.g., Google/Libre/Azure) when available.
function translateText(text, fromLang = 'auto', toLang = 'en') {
    if (!text) return '';

    // Small rule-based examples for demonstration
    // If translating Japanese to English, map a couple of common phrases
    if (fromLang === 'ja' && toLang === 'en') {
        // common phrase mapping
        const map = {
            'こんにちは': 'Hello',
            'さようなら': 'Goodbye',
            '参加しました': 'joined the room',
        };
        let out = text;
        Object.keys(map).forEach(k => {
            out = out.split(k).join(map[k]);
        });
        return out + ` (en)`;
    }

    // default: return a simple marked translation so clients can see it's "translated"
    return `[${toLang}] ${text}`;
}