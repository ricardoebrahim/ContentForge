const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const History = require('../models/History');

// Save a generation
router.post('/', auth, async (req, res) => {
  const { topic, summary, social, seo } = req.body;

  try {
    const entry = await History.create({
      userId: req.user.id,
      topic,
      summary,
      social,
      seo
    });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's history
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Delete a history entry
router.delete('/:id', auth, async (req, res) => {
  try {
    await History.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;