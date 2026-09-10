fetch('/queue')
.then(res => res.json())
.then(songs => {
    console.log(songs);
});