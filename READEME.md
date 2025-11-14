
## New Project
1. Node.js 初期化

```bash
npm init -y
```

2. パッケージインストール
### WebSocketサーバ
```bash
npm i express socket.io cors dotenv
```

### サーバーモニター
```bash
npm i -D nodemon
```

3. .env 作成

```env
GEMINI_API_KEY=あなたのAPIキー
PORT=3000
```

4. package.json の type と scripts 部分を修正

```json
...
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js"
  }
}
...
```



## 招待機能フロー
```json
[PHP + MySQL] (ログイン済み)
       ↓ user_id を JS に埋め込む
[ブラウザ JS (Socket.io client)]
       ↓ register(user_id) で Node.js に接続
[Node.js Socket.io server]
       ↔ user_id ↔ socket.id マッピング保持
       ↓
  friend_user_id に emit('invite') で直接マッチング
```

## 翻訳
### Gemini AI
```bash
npm i @google/genai
```

## サーバの起動
ターミナルを開いてコマンドを入力

```bash
```

## サーバの停止
- ターミナルで Ctrl + C


## Gemini AI インストール

```bash
npm i @google/genai
```
