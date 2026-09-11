let currentqueue = [];
let currentIndex = -1;


function showqueue(songs) {
    currentqueue = songs;
    const list = document.getElementById('songlist');
    list.innerHTML = '';
        songs.forEach((song, index) => {
            const item = document.createElement('li');
            item.textContent = song.title;
            item.addEventListener('click', () => {
                playSong(index);
            });
        list.appendChild(item);
    });
}

function playSong(index) {
    currentIndex = index;
    const song = currentqueue[index];
    const songplayer = document.getElementById('songplayer');
    songplayer.src = song.url;
    songplayer.play();
    document.getElementById('nowplaying').textContent = 'Now Playing:- ' + song.title;
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

document.getElementById('playpause').addEventListener('click', () => {
    const songplayer = document.getElementById('songplayer');
    if (songplayer.paused) {
        songplayer.play()
    }
    else {
        songplayer.pause();
    }
});

document.getElementById('skip').addEventListener('click', () => {
    if(currentIndex < currentqueue.length - 1) {
        playSong(currentIndex + 1);
    }
});