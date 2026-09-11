const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));
const PORT = 3000;

let queue= [
    {title: 'SoundHelix song 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
    {title: 'SoundHelix song 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
    {title: 'SoundHelix song 3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'},
    {title: 'SoundHelix song 4', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'},
    {title: 'SoundHelix song 5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'}

];

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