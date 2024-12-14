const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;

// MongoDB connection
const uri = 'mongodb+srv://githubaccesselias:OmicronPersei8@cluster.zj9v7.mongodb.net/Flashcards?retryWrites=true&w=majority';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Flashcard schema and model
const flashcardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const flashcardSetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cards: [flashcardSchema],
});

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(
    session({
        secret: 'yourSecretKey', // Replace with a secure secret key
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // Session expires after 1 day
    })
);

// Serve static files (frontend)
app.use(express.static('public'));

// Route to handle user login
app.post('/login', (req, res) => {
    const { email, name } = req.body;
    req.session.user = { email, name };
    req.session.save((err) => {
        if (err) {
            return res.status(500).send({ error: 'Failed to save session' });
        }
        res.send({ message: 'Login successful', user: { email, name } });
    });
});

// Route to check session and return user info
app.get('/session-check', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

// Route to save a flashcard set
app.post('/flashcards', async (req, res) => {
    try {
        const { name, cards } = req.body;
        const newSet = new FlashcardSet({ name, cards });
        await newSet.save();
        res.status(201).send({ message: 'Flashcard set saved successfully', set: newSet });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Route to get all flashcard sets
app.get('/flashcards', async (req, res) => {
    try {
        const sets = await FlashcardSet.find();
        res.send(sets);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Route to delete a flashcard set
app.delete('/flashcards/:id', async (req, res) => {
    try {
        const deletedSet = await FlashcardSet.findByIdAndDelete(req.params.id);
        if (!deletedSet) return res.status(404).send({ error: 'Flashcard set not found' });
        res.send({ message: 'Flashcard set deleted', set: deletedSet });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Route to serve the dashboard page
app.get('/dashboard/:email', (req, res) => {
    const { email } = req.params;
    if (req.session.user && req.session.user.email === email) {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
