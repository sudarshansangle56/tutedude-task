// // git add .
// // git commit -m " improvement"
// // git push origin main
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const User = require('./models/userModel');
// Middleware
app.use(bodyParser.json());
app.use(cors());
// // MongoDB connection
mongoose.connect('mongodb://localhost:27017/friendsapp', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));
// User Registration
const JWT_SECRET = 'your_jwt_secret_key';
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

// Search Users
app.get('/users', async (req, res) => {
    const { search } = req.query;

    try {
        const users = await User.find({ username: new RegExp(search, 'i') }).select('-password');
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

// Send Friend Request
app.post('/add-friend', async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add friend request
        if (!friend.friendRequests.includes(userId)) {
            friend.friendRequests.push(userId);
            await friend.save();
        }

        return res.status(200).json({ message: 'Friend request sent' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

// Accept/Reject Friend Request
app.post('/manage-friend-request', async (req, res) => {
    const { userId, friendId, action } = req.body;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (action === 'accept') {
            // Accept friend request
            if (!user.friends.includes(friendId)) {
                user.friends.push(friendId);
                friend.friends.push(userId);
            }
        }

        // Remove from friend requests
        user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== friendId);
        await user.save();
        await friend.save();

        return res.status(200).json({ message: 'Friend request managed' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});
app.post('/unfriend', async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove from friends list
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        return res.status(200).json({ message: 'Unfriended successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});