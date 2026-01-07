const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Force valid headers to look like a real Chrome browser
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://google.com'
};

app.get('/api/episode', async (req, res) => {
    let targetUrl = req.query.url;

    // 1. Validate Input
    if (!targetUrl || !targetUrl.startsWith('http')) {
        // Fallback for testing if no URL provided
        targetUrl = 'https://bspo.smarthabesha.com/SmartPlayeryz/Yegna%20Sefer/7';
    }

    try {
        console.log(`📡 Fetching: ${targetUrl}`);

        const { data } = await axios.get(targetUrl, { headers: HEADERS });
        const $ = cheerio.load(data);

        // 2. Extract Main Video
        // The site uses a standard <video> tag with id="my-player"
        const videoSrc = $('video#my-player').attr('src') || $('video source').attr('src');
        const poster = $('video#my-player').attr('poster');

        // 3. Extract Main Title (from the red text area)
        let mainTitle = $('.text-xl.uppercase').text().trim();
        if (!mainTitle) mainTitle = $('title').text().replace(' - Smart Habesha', '').trim();

        // 4. Extract Episode List (The "Grid")
        const episodes = [];

        // Based on your HTML file, the items are inside "grid grid-cols-2"
        // We select the direct children of that grid
        $('.grid.grid-cols-2 > div, .grid.grid-cols-3 > div').each((i, element) => {
            const el = $(element);

            // Extract info using the specific classes found in your file
            const link = el.find('a').attr('href');
            const img = el.find('img').first().attr('src');
            // The title is in a white text div below the image
            const title = el.find('.text-white.font-semibold').first().text().trim();

            if (link && img) {
                episodes.push({
                    id: i,
                    title: title || `Episode ${i + 1}`,
                    poster: img,
                    // Ensure link is absolute (starts with https)
                    link: link.startsWith('http') ? link : `https://bspo.smarthabesha.com${link}`
                });
            }
        });

        console.log(`✅ Success: Found Video? ${!!videoSrc} | Episodes: ${episodes.length}`);

        if (!videoSrc && episodes.length === 0) {
            // If we found nothing, the site might have blocked us or changed layout
            return res.status(500).json({ error: "Scraping failed. No video or episodes found." });
        }

        res.json({
            title: mainTitle,
            videoUrl: videoSrc,
            poster: poster,
            relatedEpisodes: episodes
        });

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Scraper running on port ${PORT}`));