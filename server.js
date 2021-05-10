const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();

const port = 3000;
const imgdir = './img/';

const storage = multer.diskStorage({
    destination: imgdir,
    filename: (req, file, cb) => {
        cb(null, crypto.randomBytes(18).toString('hex') + path.extname(file.originalname));
    }
})
const upload = multer({storage: storage})

const imgMap = new Map();

app.get('/', (req, res) => {
    res.send('Welcome to the image repo!<br>' +
        'List images: GET /images<br>' +
        'View an image: GET /images/[id]<br>'+
        'Upload an image: GET/POST /upload<br>' +
        'Delete an image: DELETE /images/[id]'
    );
})

app.get('/images', (req, res) => {
    const imgs = fs.readdirSync(imgdir);
    ret = []
    for (const img of imgs) {
        ret.push({name: img, url: '/images/' + img});
    }
    res.json(ret);
});

app.get('/images/:id', (req, res) => {
    let options = {
        root: path.join(__dirname, 'img'),
        headers: {
            'Content-Type': 'img/jpeg'
        }
    };
    res.sendFile(req.params.id, options, err => {
        console.log(err);
    });
});

app.post('/upload', upload.single('photo'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error);
    }
    imgMap.set(req.file.filename, {tags: req.body.tags})

    res.send(file);
})

app.get('/upload', (req, res) => {
    fs.readFile(__dirname + '/views/upload.html', 'utf8', (err, text) => {
        res.send(text);
    });
})

app.delete('/images/:id', ((req, res) => {
    try {
        fs.unlinkSync(path.join(imgdir, req.params.id));
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).end();
        }
    }
    res.status(200).end();
}))

const server = app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
})
