const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, '..'))); // Serve files from parent directory
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
        console.log('Received request body:', req.body);
        console.log('Received file:', req.file);
        
        // Log each field individually
        console.log('Field values:');
        console.log('businessName:', req.body.businessName);
        console.log('businessType:', req.body.businessType);
        console.log('stamps:', req.body.stamps);
        console.log('topselling1:', req.body.topselling1);
        console.log('topselling2:', req.body.topselling2);
        console.log('topselling3:', req.body.topselling3);
        console.log('reward:', req.body.reward);
        console.log('state:', req.body.state);
        console.log('minpurchase:', req.body.minpurchase);
        
        // Validate required fields
        const requiredFields = ['businessName', 'businessType', 'stamps', 'topselling1', 'topselling2', 'topselling3', 'reward', 'state', 'minpurchase'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
        }
        
        // Read existing businesses
        const businesses = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
        
        // Create new business object with explicit field assignments
        const newBusiness = {
            id: Date.now().toString(),
            businessName: req.body.businessName || '',
            businessType: req.body.businessType || '',
            stamps: req.body.stamps || '',
            topselling1: req.body.topselling1 || '',
            topselling2: req.body.topselling2 || '',
            topselling3: req.body.topselling3 || '',
            reward: req.body.reward || '',
            state: req.body.state || '',
            minpurchase: req.body.minpurchase || '',
            logoImage: req.file ? `${BASE_URL}/${req.file.filename}` : './images/default-business.png'
        };
        
        console.log('New business object:', newBusiness);
        
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

// Endpoint to delete a business
app.delete('/businesses/:id', (req, res) => {
    try {
        const businessId = req.params.id;
        const businesses = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
        
        // Find the business index
        const businessIndex = businesses.findIndex(business => business.id === businessId);
        
        if (businessIndex === -1) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        // Remove the business from the array
        const deletedBusiness = businesses.splice(businessIndex, 1)[0];
        
        // Save the updated businesses array
        fs.writeFileSync('businesses.json', JSON.stringify(businesses, null, 2));
        
        res.json({ success: true, message: 'Business deleted successfully', business: deletedBusiness });
    } catch (error) {
        console.error('Error deleting business:', error);
        res.status(500).json({ error: 'Failed to delete business' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Base URL: ${BASE_URL}`);
});