const supa = supabase.createClient('https://fighwcwkytmpuuiyqdzt.supabase.co','sb_publishable_popke49BB48cOKO7IOe_IQ_m9puXtQJ');
let currentqueue = [];
let currentIndex = -1;
let centerIndex = 0
let fullQueue = []
let removemode = false;
let songplaycurrent = null;
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
        cross.addEventListener('click', async event => {
            event.stopPropagation();
            if(!(await deleteallow())) return;
            fetch('/queue/' + song.id, {
                method: 'DELETE',
                
            })
            .then(res => res.json())
            .then(updatedSongs => {
                fullQueue = updatedSongs;
                currentqueue = updatedSongs.filter(song => !localsong.includes(song.id));
                if(index < centerIndex) {
                        centerIndex--;
                    }
                if(centerIndex >= currentqueue.length) {
                    
                    centerIndex = Math.max(currentqueue.length -1, 0);
                }

                if(currentqueue.length=== 0) {
                    document.getElementById('nowplaying').textContent = 'Select a song to play';
                document.getElementById('songplayer').pause();
                document.getElementById('songplayer').src = '';
                currentIndex = -1;
                
                }
                showqueue(currentqueue);
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
           if(index < centerIndex) {
                    centerIndex--;
                }
           
            if(centerIndex >= currentqueue.length) {
                
                centerIndex = Math.max(currentqueue.length - 1, 0); 

                
            }
            showqueue(currentqueue);
        });
        slotElement.appendChild(removelocal);
    }

}



function playSong(index) {
    const song = currentqueue[index];
    if(!song) return;
    currentIndex = index;
    songplaycurrent = song.id;
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
    const submitbtn = event.target.querySelector('button[type="submit"]');
    submitbtn.disabled = true;
    submitbtn.textContent = 'Adding song';
    console.log('adddingggg sooonnnnnnnggggggg');
    await new Promise(r => setTimeout(r, 3000));

    const titleInput = document.getElementById('songtitle');
    const linkInput = document.getElementById('urlofsong');
    const fileInput = document.getElementById('songfile');

    let url = linkInput.value;
    const file = fileInput.files[0];
    if(!file && !url) {
        alert('enter url or file');
        submitbtn.disabled = false;
        submitbtn.textContent = 'Add song to queue';
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
            submitbtn.disabled = false;
            submitbtn.textContent = 'Add song to queue';
            return;
        }
        
        const {error: uploadError } =await supa.storage
        .from('songs')
        .uploadToSignedUrl(tokendata.path, tokendata.token, file, {contentType: file.type});
        if(uploadError) {
            alert(uploadError.message);
            submitbtn.disabled = false;
            submitbtn.textContent = 'Add song to queue';
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
            submitbtn.disabled = false;
            submitbtn.textContent = 'Add song to queue';
            return;
        }
        fullQueue = songs;
        currentqueue = songs.filter(song => !localsong.includes(song.id));
        centerIndex = currentIndex.length - 1;
        showqueue(currentqueue);

        titleInput.value = '';
        linkInput.value = '';
        fileInput.value = '';
        submitbtn.disabled = false;
        submitbtn.textContent = 'Add song to queue';
         
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
    const visible = fullQueue.filter(song => !localsong.includes(song.id));
    currentqueue = visible;


    
    if (query !== '') {
        const foundIndex = visible.findIndex(song => song.title.toLowerCase().includes(query));
        if (foundIndex !== -1) 
            centerIndex = foundIndex
        
        
    }
    else if(currentIndex !== -1) {
        centerIndex = currentIndex;
    }
        showqueue(currentqueue);
});

document.getElementById('enableclearandremove').addEventListener('click', () => {
    removemode = !removemode;
    document.getElementById('clearqueue').style.display = removemode ? 'block' : 'none';
    showqueue(currentqueue);
});

let isstaff = false;

async function deleteallow() {
    if(isstaff) 
        return true;
    if(confirm('Log in as staff?') === false) return false;
    const password = prompt('Staff Password: ');
    const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({password})
    });
    const ok = (await res.json()).ok;
    if (ok) isstaff = true
    else alert('wrong password');
    return ok;
}

document.getElementById('stafflogin').addEventListener('click' , () => {
    const password = prompt('enter Staff password: ');
    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: password})
    })
    .then(res => res.json())
    .then(data => {
        if(data.ok)  {
            isstaff = true;
            alert('logged in');
        }
        else 
            alert('wrong password')
    });
});

document.getElementById('clearqueue').addEventListener('click', async () => {
     if(!(await deleteallow())) return;
    fetch('/queue', {
        method: 'DELETE',
        
    })
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
        if(songplaycurrent !== null) {
            const playingpos = currentqueue.findIndex(song => song.id === songplaycurrent);
            if(playingpos !== -1){
                currentIndex = playingpos;
            }

            else {
                document.getElementById('songplayer').pause();
                document.getElementById('songplayer').src = '';
                document.getElementById('nowplaying').textContent = 'Select a song to play';
                currentIndex = -1;
                songplaycurrent = null;
            }
        }
        
        showqueue(currentqueue);

    });
    
}, 3000);