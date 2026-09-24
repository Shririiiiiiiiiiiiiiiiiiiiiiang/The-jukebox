const supa = supabase.createClient('https://fighwcwkytmpuuiyqdzt.supabase.co','sb_publishable_popke49BB48cOKO7IOe_IQ_m9puXtQJ');
let currentqueue = [];
let currentIndex = -1;
let centerIndex = 0
let fullQueue = []
let removemode = false;
let localsong = JSON.parse(localStorage.getItem('localsong') || '[]');


function showqueue(songs) {
    
    currentqueue = songs;
    const top = document.getElementById('topsong');
    const mid = document.getElementById('midsong');
    const bottom = document.getElementById('bottomsong');

    slotcontent(top, centerIndex - 1);
    slotcontent(mid, centerIndex);
    slotcontent(bottom, centerIndex + 1);

    mid.onclick = () => {
       
        playSong(centerIndex);
        
    };

}

function slotcontent(slotElement, index) {
    const song = currentqueue[index];
    slotElement.innerHTML = '';

    if(!song) 
        return;

    const titlespan = document.createElement('span');
    titlespan.textContent = song.title;
    slotElement.appendChild(titlespan);
    if(removemode) {
        const cross = document.createElement('span');
        cross.textContent = ' X '
        cross.className = 'cross';
        cross.addEventListener('click', event => {
            event.stopPropagation();
            fetch('/queue/' + song.id, {method: 'DELETE'})
            .then(res => res.json())
            .then(updatedSongs => {
                fullQueue = updatedSongs;
                currentqueue = updatedSongs.filter(song => !localsong.includes(song.id));
                showqueue(updatedSongs);
            });
        });
        slotElement.appendChild(cross);

        const removelocal = document.createElement('span');
        removelocal.textContent =  ' hide ';
        removelocal.className = 'hide';
        removelocal.addEventListener('click', event => {
            event.stopPropagation();
            localsong.push(song.id);
            localStorage.setItem('localsong', JSON.stringify(localsong));
            currentqueue = fullQueue.filter(s => !localsong.includes(s.id));
            showqueue(currentqueue);
        });
        slotElement.appendChild(removelocal);
    }

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
    fullQueue = songs;
    currentqueue = songs.filter(song => !localsong.includes(song.id));
    showqueue(currentqueue);

});

document.getElementById('formtoaddsong').addEventListener('submit', async event => {
    event.preventDefault();

    const titleInput = document.getElementById('songtitle');
    const linkInput = document.getElementById('urlofsong');
    const fileInput = document.getElementById('songfile');

    let url = linkInput.value;
    const file = fileInput.files[0];
    if(!file && !url) {
        alert('enter url or file');
        return;
    }
    if(file) {
        const tokenres = await fetch('/upload-url', {
            method: 'POST',
            headers: {'Content-type' : 'application/json'},
            body: JSON.stringify({filename: file.name})
        });
        const tokendata = await tokenres.json();
        if(!tokenres.ok) {
            alert(tokendata.error || "not uploaded pls check");
            return;
        }
        
        const {error: uploadError } =await supa.storage
        .from('songs')
        .uploadToSignedUrl(tokendata.path, tokendata.token, file, {contentType: file.type});
        if(uploadError) {
            alert(uploadError.message);
            return;
        }
        url= tokendata.publicUrl;
    }

   
    const res = await fetch('/queue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({title: titleInput.value, url: url})
    });
    const songs = await res.json();
        if(!Array.isArray(songs)) {
            alert(songs.error || "Nah you did something wrong")
            return;
        }
        fullQueue = songs;
        currentqueue = songs.filter(song => !localsong.includes(song.id));
        showqueue(currentqueue);

        titleInput.value = '';
        linkInput.value = '';
        fileInput.value = '';
         
});

document.getElementById('playpause').addEventListener('click', () => {
    const songplayer = document.getElementById('songplayer');
    if (currentIndex === -1) {
        playSong(0);
        centerIndex = 0;
        showqueue(currentqueue);
        return;
    }

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
        centerIndex = currentIndex;
        showqueue(currentqueue);
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

document.getElementById('searchbox').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    if(query === '') return;

    const foundIndex = fullQueue.findIndex(song => song.title.toLowerCase().includes(query));
    if (foundIndex !== -1) {
        currentqueue = fullQueue;
        centerIndex = foundIndex;
        showqueue(currentqueue);
    }

});

document.getElementById('enableclearandremove').addEventListener('click', () => {
    removemode = !removemode;
    document.getElementById('clearqueue').style.display = removemode ? 'block' : 'none';
    showqueue(currentqueue);
});

document.getElementById('clearqueue').addEventListener('click', () => {
    fetch('/queue', {method: 'DELETE'})
    .then(res => res.json())
    .then(songs => {
    fullQueue = songs;
    currentqueue = songs.filter(song => !localsong.includes(song.id));
    centerIndex = 0;
    showqueue(currentqueue);

    });
})

setInterval(() => {
    fetch('/queue')
    .then(res => res.json())
    .then(songs => {
        fullQueue = songs;
        currentqueue = songs.filter(song => !localsong.includes(song.id));
        showqueue(currentqueue);

    });
    
}, 3000);