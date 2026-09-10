const express = require('express');
const app = express();
const PORT = 3000;

let queue= [];

app.get('/queue', (req, res) => {
    res.json(queue);
});

app.listen(PORT, () => {
    console.log(`jukebox server is running on http://${PORT}`);
});