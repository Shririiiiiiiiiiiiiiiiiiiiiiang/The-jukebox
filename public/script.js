function showqueue(songs) {
    const list = document.getElementById('songlist');
    list.innerHTML = '';
    songs.forEach(song => {
        const item = document.createElement('li');
        item.textContent = song.title;
        list.appendChild(item);
    });
}

fetch('/queue')
.then(res => res.json())
.then(songs => {
    showqueue(songs);

});

document.getElementById('formtoaddsong').addEventListener('submit', event => {
    event.preventDefault();

    const titleInput = document.getElementById('songtitle');
    const linkInput = document.getElementById('urlofsong');
    const title = titleInput.value;
    const link = linkInput.value;
    fetch('/queue', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({title: title, url: link})
    })
    .then(res => res.json())
    .then(songs => {
        showqueue(songs);
    });
    titleInput.value = '';
    linkInput.value = '';
});