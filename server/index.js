const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const generateRoute = require('./routes/generate');
const authRoute = require('./routes/auth');
const historyRoute = require('./routes/history');


const app = express();

//Middleware
app.use(cors({
origin: ['http://localhost:5173', 'https://contentforge-ash.netlify.app'],
credentials: true
}));
app.use(express.json());


// Test route
app.get('/', (req, res) => {
  res.send('ContentForge server is running');
});

// Connect to MongoDB and start server
app.use('/api/generate', generateRoute);
app.use('/api/auth', authRoute);
console.log('Auth route registered');
app.use('/api/history', historyRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));