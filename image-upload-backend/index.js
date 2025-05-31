const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.static('uploads'));
app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Create businesses.json if it doesn't exist
if (!fs.existsSync('businesses.json')) {
    fs.writeFileSync('businesses.json', JSON.stringify([]));
}

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
    try {
        // Read existing businesses
        const businesses = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
        
        // Create new business object
        const newBusiness = {
            businessName: req.body.businessName,
            businessType: req.body.businessType,
            stamps: req.body.stamps,
            topselling1: req.body.topselling1,
            topselling2: req.body.topselling2,
            topselling3: req.body.topselling3,
            logoImage: req.file ? `http://localhost:3000/${req.file.filename}` : null
        };
        
        // Add new business to array
        businesses.push(newBusiness);
        
        // Save updated businesses array
        fs.writeFileSync('businesses.json', JSON.stringify(businesses, null, 2));
        
        res.json({ success: true, business: newBusiness });
    } catch (error) {
        console.error('Error saving business:', error);
        res.status(500).json({ success: false, error: 'Failed to save business data' });
    }
});

// Endpoint to get all businesses
app.get('/businesses', (req, res) => {
    try {
        const businesses = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
        res.json(businesses);
    } catch (error) {
        console.error('Error reading businesses:', error);
        res.status(500).json({ error: 'Failed to read businesses' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});