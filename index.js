const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));
const PORT = 3000;

let queue= [];

app.get('/queue', (req, res) => {
    res.json(queue);
});

app.post('/queue', (req, res) => {
    const song = req.body;
    queue.push(song);
    res.json(queue);
})

app.listen(PORT, () => {
    console.log(`jukebox server is running on http://localhost:${PORT}`);
});