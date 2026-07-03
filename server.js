const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// publicフォルダ（この後作ります）の中身をブラウザに送信する設定
app.use(express.static(path.join(__dirname, 'public')));

// タイムトラベル（チート）対策用の時間取得API
app.get('/api/time', (req, res) => {
    res.json({ serverTime: Date.now() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});