const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get the schedule
app.get('/api/schedule', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'talks.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        try {
            const talks = JSON.parse(data);
            res.json(talks);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).json({ error: 'Failed to parse data' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
