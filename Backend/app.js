const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/friendsapp', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  name: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.model('User', userSchema);

// Route to add a new user
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  const newUser = new User({ name });
  await newUser.save();
  res.status(201).json(newUser);
});

// Route to get all users

app.get('/api/users', async (req, res) => {
  const users = await User.find().populate('friends');
  res.json(users);
});

// Route to search for users by name
app.get('/api/users/search', async (req, res) => {
  const { name } = req.query;
  const users = await User.find({ name: new RegExp(name, 'i') });
  res.json(users);
});

// Route to add a friend to a user
app.post('/api/users/:id/friends', async (req, res) => {
  const { friendId } = req.body;
  const user = await User.findById(req.params.id);
  const friend = await User.findById(friendId);

  if (!user || !friend) return res.status(404).json({ message: 'User not found' });

  user.friends.push(friend);
  await user.save();
  res.json(user);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
