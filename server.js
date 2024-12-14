const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Add this for resolving file paths
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static('public'));

// In-memory user data (for simplicity)
const users = {};

// Route to handle user login
app.post('/login', (req, res) => {
    const { email, name } = req.body;
    if (!users[email]) {
        users[email] = { name, progress: {} };
    }
    res.send({ message: 'Login successful', user: users[email] });
});

// Route to get user-specific data
app.get('/user/:email', (req, res) => {
    const email = req.params.email;
    if (users[email]) {
        res.send(users[email]);
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

app.get('/dashboard/:email', (req, res) => {
    const email = req.params.email;
    const user = users[email];

    if (user) {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        res.status(404).send("User not found");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
