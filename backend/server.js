const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Route to get video info
app.get('/api/episode', async (req, res) => {
    const targetUrl = req.query.url;

    // 1. Safety Check: Is it a valid URL?
    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).json({
            error: 'Invalid URL. Please provide a full link starting with http/https.'
        });
    }

    try {
        console.log(`Scraping: ${targetUrl}`);

        // 2. Fetch with "Browser Disguise" (User-Agent)
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // 3. Extract Video (Try multiple ways)
        let videoSrc = $('video#my-player').attr('src') ||
            $('source').first().attr('src');

        const poster = $('video#my-player').attr('poster');
        const title = $('title').text().replace(' - Smart Habesha', '').trim();

        // 4. Extract Episodes
        const episodes = [];

        // Find all links that look like episode cards
        $('a').each((i, el) => {
            const link = $(el).attr('href');
            const img = $(el).find('img').attr('src');
            const text = $(el).text().trim();

            // Filter: Only keep links that look like episodes
            if (link && link.includes('SmartPlayeryz') && img) {
                episodes.push({
                    id: i,
                    title: text || "Episode " + (i + 1),
                    poster: img,
                    link: link.startsWith('http') ? link : `https://bspo.smarthabesha.com${link}`
                });
            }
        });

        // Debug Log
        console.log(`Found Video: ${videoSrc ? 'Yes' : 'No'}`);
        console.log(`Found Episodes: ${episodes.length}`);

        res.json({
            videoUrl: videoSrc,
            poster: poster,
            title: title || "Smart Habesha Player",
            relatedEpisodes: episodes
        });

    } catch (error) {
        console.error("Scraper Error:", error.message);
        res.status(500).json({ error: 'Failed to scrape data', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));
