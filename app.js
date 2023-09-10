const express = require('express');
const axios = require('axios');
const app = express();

// Function to fetch numbers from a URL
const fetchNumbers = async (url) => {
    try {
        // Set a timeout of 500 milliseconds
        const response = await axios.get(url, { timeout: 500 });
        if (
            response.status === 200
            &&
            response.data
            &&
            Array.isArray(response.data.numbers)
        ) {
            return response.data.numbers;
        }
        throw new Error('Invalid response');
    } catch (error) {
        console.error(`Error fetching data  ${url}: ${error.message}`);
        return [];
    }
};

// Endpoint to fetch numbers from multiple URLs
app.get('/numbers', async (req, res) => {
    const urls = req.query.url;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({
            error: 'Invalid or missing URL'
        });
    }

    try {
        const allNumbers = [];
        const promise = urls.map(
            (url) => fetchNumbers(url)
        );
        const results = await Promise.all(promise);

        // Merge and deduplicate the numbers from all URLs
        results.forEach((numbers) => {
            allNumbers.push(...numbers);
        });

        // Remove duplicates and sort the merged numbers
        const mergedNumbers = Array.from(new Set(allNumbers)).sort((a, b) => a - b);

        return res.json({ numbers: mergedNumbers });
    } catch (error) {
        console.error(`Error processing URLs: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT || 8008;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
