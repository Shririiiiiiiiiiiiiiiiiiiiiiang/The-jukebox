require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const path = require('path');
const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
const PORT = process.env.PORT || 3000;



app.get('/queue', async (req, res) => {
    const { data, error } = await supabase.from('songs').select('*').order('id');
    if (error) return res.status(500).json({error: error.message });

    res.json(data);
});





app.post('/queue',upload.single('songfile'), async (req, res) => {
const {title }  = req.body;
let url= req.body.url;
if(!req.file && !url) return res.status(400).json({error: 'enter a url or a file'})

if(req.file) {
    const filename = Date.now() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); //added the datenow just to put a costom timestam for to if two people upload same thing so it should not overwritee
    const {error: uploadError} = await supabase.storage
    .from('songs')
    .upload(filename, req.file.buffer, {contentType: req.file.mimetype});
    if(uploadError) 
        return res.status(500).json({error: uploadError.message});
    const {data: publicurldata} = supabase.storage.from('songs').getPublicUrl(filename);
    url = publicurldata.publicUrl;
}



const { data, error } = await supabase.from('songs').insert([{title, url }]).select();
if(error) 
    return res.status(500).json({error: error.message});
const{data: allSongs} = await supabase.from('songs').select('*').order('id');
    
    res.json(allSongs);
})







app.delete('/queue', async(req, res) => {
    const {error} = await supabase.from('songs').delete().neq('id', 0);
    if (error) return res.status(500).json({error: error.message});
    res.json([]);
});

app.delete('/queue/:id', async (req, res) => {
    const id = req.params.id;
    const {error} = await supabase.from('songs').delete().eq('id', id)
    if(error)
        return res.status(500).json({error: error.message});
    const{ data: allSongs} = await supabase.from('songs').select('*').order('id');
    res.json(allSongs);
});

app.listen(PORT, () => {
    console.log(`jukebox server is running on http://localhost:${PORT}`);
});