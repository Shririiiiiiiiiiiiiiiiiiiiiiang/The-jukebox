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

document.getElementById('formtoaddsong').addEventListener('submit', event => {
    event.preventDefault();

    const titleInput = document.getElementById('songtitle');
    const title = titleInput.value;
    fetch('/queue', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({title: title})
    })
    .then(res => res.json())
    .then(songs => {
        console.log(songs);
    });
    titleInput.value = '';
});