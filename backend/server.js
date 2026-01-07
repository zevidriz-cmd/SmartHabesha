const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Smart Habesha Scraper API is running');
});

// Scraper endpoint
app.get('/api/episode', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // 1. Fetch the HTML
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // 2. Extract Video Source
        // The player often has id="my-player"
        const videoElement = $('video#my-player, video');
        const videoSrc = videoElement.attr('src');
        const poster = videoElement.attr('poster');

        // 3. Extract Episode List
        // Looking for the "episode-list" container and links inside it.
        // Based on research: 
        // Structure: <div class="episode-list"> ... <a href="..."> <img src="..."> </a> ... </div>
        // Or sometimes they are just straight links in a container.
        // We will look for <a> tags that look like episode links.
        
        const episodes = [];
        
        // Strategy: specific container or heuristic search
        // We observed links usually have "SmartPlayeryz/Yegna%20Sefer" in href
        
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/SmartPlayeryz/')) {
                const img = $(el).find('img').attr('src');
                const text = $(el).text().trim() || 'Episode ' + (i + 1);
                
                // Deduplicate or basic cleanup if needed
                // Only add if we haven't seen this exact link before? 
                // For now, let's just push details.
                episodes.push({
                    title: text,
                    url: href,
                    thumbnail: img || poster // Fallback to poster if no specific thumb
                });
            }
        });

        // Filter out duplicates if any
        const uniqueEpisodes = episodes.filter((ep, index, self) =>
            index === self.findIndex((t) => (
                t.url === ep.url
            ))
        );

        res.json({
            videoSrc,
            poster,
            title: $('title').text().trim(),
            episodes: uniqueEpisodes
        });

    } catch (error) {
        console.error('Error scraping:', error.message);
        res.status(500).json({ error: 'Failed to fetch episode data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
