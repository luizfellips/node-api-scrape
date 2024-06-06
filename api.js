const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const port = 3000;


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

/**
 * Function to mimic a browser request and avoid blocking due to server issue or network error by retrying the request x times
 * @param url Url to fetch
 * @param retries number of retry attempts(default 3)
 */

const fetchAmazonPage = async (url, retries = 3) => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, {
                headers: { 'User-Agent': userAgent }
            });
        } catch (error) {
            if (i < retries - 1) {
                console.log(`Retrying... (${i + 1})`);
                await new Promise(res => setTimeout(res, 2000));
            } else {
                throw error;
            }
        }
    }
};

/**
 * API endpoint to scrape results and return a json with data
 */
app.get('/api/scrape', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).send('Keyword query parameter is required');
    }

    try {
        const response = await fetchAmazonPage(`https://www.amazon.com.br/s?k=${keyword}`);
        const document = new JSDOM(response.data).window.document;
        const searchResults = document.querySelectorAll('[data-component-type="s-search-result"]');

        const results = Array.from(searchResults).map((element, index) => {
            const titleElement = element.querySelector('.a-size-mini.a-spacing-none.a-color-base');
            const starsElement = element.querySelector('.a-icon-alt');
            const reviewElement = element.querySelector('.a-size-base.s-underline-text');
            const imageElement = element.querySelector('img.s-image');

            return {
                title: titleElement ? titleElement.textContent.trim() : 'No title found',
                stars: starsElement ? starsElement.textContent.trim() : 'No stars found',
                reviews: reviewElement ? reviewElement.textContent.trim() : 'No reviews found',
                imageUrl: imageElement ? imageElement.src : 'No image found',
            };
        });

        res.json(results);

    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});