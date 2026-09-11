let currentqueue = [];
let currentIndex = -1;
let centerIndex = 0


function showqueue(songs) {
    currentqueue = songs;
    const top = document.getElementById('topsong');
    const mid = document.getElementById('midsong');
    const bottom = document.getElementById('bottomsong');

    top.textContent = currentqueue[centerIndex -1] ? currentqueue[centerIndex - 1].title : '';
    mid.textContent = currentqueue[centerIndex] ? currentqueue[centerIndex].title : '';
    bottom.textContent = currentqueue[centerIndex + 1] ? currentqueue[centerIndex + 1].title : '';

    mid.onclick = () => {
       
        playSong(centerIndex);
        
    };

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

const volknob = document.getElementById('volumeknob');
const knobshow = document.getElementById('knobshow');
let knobangle = -135;
knobshow.style.transform = `translateX(-50%) rotate(${knobangle}deg)`;
document.getElementById('songplayer').volume = 0;

volknob.addEventListener('mousedown', () => {
    document.addEventListener('mousemove', turnknob);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', turnknob);
    });
});

function turnknob(event) {
    const knobbox = volknob.getBoundingClientRect();
    const centerx = knobbox.left + knobbox.width / 2;
    const centery = knobbox.top + knobbox.height / 2;
    const dx = event.clientX - centerx;
    const dy = event.clientY - centery;

    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);

    if(angle < -135) angle = -135;
    if(angle > 135) angle = 135;

    knobangle = angle;
    knobshow.style.transform = `translateX(-50%) rotate(${angle}deg)`;

    const volume = (angle + 135) / 270;
    document.getElementById('songplayer').volume = volume;
}

document.getElementById('ptsonglist').addEventListener('wheel', event => {
    event.preventDefault();

    if(event.deltaY > 0) {
        if(centerIndex < currentqueue.length - 1) {
            centerIndex++;
        }
    }
    else {
        if(centerIndex > 0) {
            centerIndex--;
        }
    }
    showqueue(currentqueue);
});