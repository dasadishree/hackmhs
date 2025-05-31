const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Read and write functions for JSON files
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { businesses: [] };
    }
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// User data handling
const USERS_FILE = 'users.json';

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    writeJsonFile(USERS_FILE, { users: [] });
}

// User registration endpoint
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const users = readJsonFile(USERS_FILE);

    // Check if user already exists
    if (users.users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = {
        email,
        password, // In a real app, you should hash the password
        stamps: {} // Object to store stamps for each business
    };

    users.users.push(newUser);
    writeJsonFile(USERS_FILE, users);

    res.json({ success: true, message: 'User registered successfully' });
});

// User login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readJsonFile(USERS_FILE);

    const user = users.users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, user: { email: user.email, stamps: user.stamps } });
});

// Update user stamps endpoint
app.post('/update-stamps', (req, res) => {
    const { email, businessId, stamps } = req.body;
    const users = readJsonFile(USERS_FILE);

    const userIndex = users.users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users.users[userIndex].stamps[businessId] = stamps;
    writeJsonFile(USERS_FILE, users);

    res.json({ success: true, stamps: users.users[userIndex].stamps });
});

// Get user stamps endpoint
app.get('/user-stamps/:email', (req, res) => {
    const { email } = req.params;
    const users = readJsonFile(USERS_FILE);

    const user = users.users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ stamps: user.stamps });
});

// Existing business endpoints
app.post('/upload', upload.single('logoImage'), (req, res) => {
    const businesses = readJsonFile('businesses.json');
    const newBusiness = {
        id: Date.now().toString(),
        businessName: req.body.businessName,
        businessType: req.body.businessType,
        stamps: req.body.stamps,
        topselling1: req.body.topselling1,
        topselling2: req.body.topselling2,
        topselling3: req.body.topselling3,
        reward: req.body.reward,
        logoImage: req.file ? `/uploads/${req.file.filename}` : null
    };

    businesses.businesses.push(newBusiness);
    writeJsonFile('businesses.json', businesses);

    res.json({ success: true, business: newBusiness });
});

app.get('/businesses', (req, res) => {
    const businesses = readJsonFile('businesses.json');
    res.json(businesses.businesses);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}); 