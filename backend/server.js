const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Use a standard browser header to avoid being blocked
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://bspo.smarthabesha.com/'
};

app.get('/api/episode', async (req, res) => {
    // 1. Get URL or use default for testing
    let targetUrl = req.query.url;
    if (!targetUrl) {
        targetUrl = 'https://bspo.smarthabesha.com/SmartPlayeryz/Yegna%20Sefer/7';
    }

    try {
        console.log(`📡 Fetching: ${targetUrl}`);
        const { data } = await axios.get(targetUrl, { headers: HEADERS });
        const $ = cheerio.load(data);

        // --- STEP 2: EXTRACT VIDEO ---
        // Your file shows the video has id="my-player"
        const videoSrc = $('video#my-player').attr('src') || $('video source').first().attr('src');
        const poster = $('video#my-player').attr('poster');

        // --- STEP 3: EXTRACT TITLE ---
        // The main title is usually in a text-xl div
        let mainTitle = $('.text-xl.uppercase').text().trim();
        if (!mainTitle) mainTitle = "Smart Habesha Player";

        // --- STEP 4: EXTRACT EPISODES ---
        const episodes = [];

        // CRITICAL FIX: Use the specific gradient class found in your HTML file
        // Every episode card has this class: "bg-gradient-to-r"
        $('.bg-gradient-to-r').each((i, el) => {
            const $el = $(el);

            // Find the link (first <a> tag inside the card)
            const link = $el.find('a').first().attr('href');

            // Find the image (first <img> tag)
            const img = $el.find('img').first().attr('src');

            // Find the title (div with text-white and font-semibold)
            const title = $el.find('.text-white.font-semibold').text().trim();

            if (link && img) {
                // Fix relative links if necessary
                const fullLink = link.startsWith('http') ? link : `https://bspo.smarthabesha.com${link}`;

                episodes.push({
                    id: i,
                    title: title || `Episode ${i + 1}`,
                    poster: img,
                    link: fullLink
                });
            }
        });

        console.log(`✅ Scrape Result: Found Video? ${!!videoSrc} | Episodes Found: ${episodes.length}`);

        // Return whatever we found (even if video is missing, show episodes)
        res.json({
            title: mainTitle,
            videoUrl: videoSrc, // Might be null if blocked, but won't crash 500
            poster: poster,
            relatedEpisodes: episodes
        });

    } catch (error) {
        console.error("❌ Scraper Error:", error.message);
        // Return 500 only if the network call failed entirely
        res.status(500).json({ error: 'Failed to scrape', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));