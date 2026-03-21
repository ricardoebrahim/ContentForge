const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', auth, async (req , res) => {
const { topic } = req.body;

if (!topic) {
return res.status(400).json({ error: 'Topic is required'});
}

try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a content assistant. Generate content for the topic: "${topic}".

    Respond in this EXACT format with these EXACT labels and nothing else before or after:

    SUMMARY:
    Write exactly 3 sentences summarizing the topic.

    SOCIAL_POST:
    Write on engaging social media post with relevant hashtags.

    SEO_DESCRIPTION:
     Write a 150-word SEO-optimizied description.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, content: text });

  } catch (error) {
    console.log('GEMINI ERROR:', error.message);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;