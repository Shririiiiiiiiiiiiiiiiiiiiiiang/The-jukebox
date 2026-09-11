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

app.delete('/queue', (req, res) => {
    queue = [];
    res.json(queue);
});

app.delete('/queue/:index', (req, res) => {
    const index = parseInt(req.params.index);
    queue.splice(index, 1);
    res.json(queue);
});

app.listen(PORT, () => {
    console.log(`jukebox server is running on http://localhost:${PORT}`);
});