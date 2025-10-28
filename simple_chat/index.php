<?php
require_once __DIR__ . '/lib/lang.php';
?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8" />
  <title>Socket.io Chat</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>

<body class="bg-gray-100 h-screen flex flex-col items-center p-6">
  <h1 class="text-2xl font-bold mb-4 text-blue-600">💬 簡単チャット</h1>

  <div
    id="chatBox"
    class="w-full max-w-md flex-1 overflow-y-auto border rounded-lg bg-white shadow p-4 mb-4"></div>

  <form
    id="chatForm"
    class="w-full max-w-md flex space-x-2"
    autocomplete="off">
    <input
      id="msgInput"
      type="text"
      placeholder="メッセージを入力..."
      class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
    <button
      type="submit"
      class="bg-blue-500 text-white rounded-lg px-4 hover:bg-blue-600 transition">
      送信
    </button>
  </form>

  <script src="js/env.js" defer></script>
  <script src="js/app.js" defer></script>
</body>

</html>