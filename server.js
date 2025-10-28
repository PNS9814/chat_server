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

    // WebSocket切断時の処理
    socket.on("disconnect", () => {
        console.log(`🔴 Disconnected: ${socket.id}`);
    });
});
