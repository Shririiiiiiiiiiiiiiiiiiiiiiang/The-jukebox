fetch('/queue')
.then(res => res.json())
.then(songs => {
    const list = document.getElementById('songlist');
    songs.forEach(song => {
        const item = document.createElement('li');
        item.textContent = song.title;
        list.appendChild(item);
    });
});