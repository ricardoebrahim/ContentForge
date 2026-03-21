const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const generateRoute = require('./routes/generate');
const authRoute = require('./routes/auth');


const app = express();

//Middleware
app.use(cors());
app.use(express.json());


// Test route
app.get('/', (req, res) => {
  res.send('ContentForge server is running');
});

// Connect to MongoDB and start server
app.use('/api/generate', generateRoute);
app.use('/api/auth', authRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));