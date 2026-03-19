const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req , res) => {
const { topic } = req.body;

if (!topic) {
return res.status(400).json({ error: 'Topic is required'});
}

try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a content creation assistant. Given the topic: "${topic}", generate:
    1. SUMMARY: A 3-sentence summary
    2. SOCIAL POST: A short engaging social media post with hashtags
    3. SEO DESCRIPTION: A 150-word SEO-optimized description
    Format your response with clear labels for each section.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, content: text });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;