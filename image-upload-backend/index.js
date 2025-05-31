const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('logoImage'), (req, res) => {
    res.json({imageUrl: `http://localhost:3000/${req.file.filename}`});
});

app.listen(3000, ()=> {
    console.log('Server running on http://localhost:3000');
});