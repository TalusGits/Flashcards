const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const { FlashcardSet, User } = require('./db'); // Import User model
const path = require('path');
const morgan = require('morgan'); // Import morgan middleware
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

// Middleware
app.use(morgan('combined')); // Use morgan to log HTTP requests
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
app.post('/login', async (req, res) => {
    const { email, name } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name });
            await user.save();
        }

        console.log('User logged in:', user);

        req.session.user = { _id: user._id, email: user.email, name: user.name }; // Simplify session data
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).send({ error: 'Failed to save session' });
            }
            res.send({ message: 'Login successful', user: req.session.user });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ error: error.message });
    }
});

// Route to check session and return user info
app.get('/session-check', (req, res) => {
    if (req.session.user) {
        console.log('Session check: user is logged in', req.session.user); // Log session check
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        console.log('Session check: no user logged in'); // Log session check
        res.send({ loggedIn: false });
    }
});

// Route to save a flashcard set
app.post('/flashcards', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const { name, cards } = req.body;
        const newSet = new FlashcardSet({
            name,
            cards,
            user: req.session.user._id, // Associate with the logged-in user
        });
        await newSet.save();
        res.status(201).send({ message: 'Flashcard set saved successfully', set: newSet });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Route to get all flashcard sets
app.get('/flashcards', async (req, res) => {
    if (!req.session.user) {
        console.log('Unauthorized access attempt to flashcards');
        return res.status(401).send({ error: 'Unauthorized' });
    }

    console.log('Session user:', req.session.user);

    try {
        const sets = await FlashcardSet.find({ user: req.session.user._id });
        console.log(`Retrieved flashcard sets for user ${req.session.user.email}: ${JSON.stringify(sets)}`);
        res.send(sets);
    } catch (error) {
        console.error('Error retrieving flashcard sets:', error);
        res.status(500).send({ error: error.message });
    }
});

// Route to delete a flashcard set
app.delete('/flashcards/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const deletedSet = await FlashcardSet.findOneAndDelete({
            _id: req.params.id,
            user: req.session.user._id, // Ensure the user owns the set
        });

        if (!deletedSet) {
            return res.status(404).send({ error: 'Flashcard set not found or unauthorized' });
        }

        res.send({ message: 'Flashcard set deleted', set: deletedSet });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Route to update a flashcard set by ID
app.put('/flashcards/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const { name, cards } = req.body;
        const updatedSet = await FlashcardSet.findOneAndUpdate(
            { _id: req.params.id, user: req.session.user._id }, // Ensure the user owns the set
            { name, cards },
            { new: true, runValidators: true }
        );

        if (!updatedSet) {
            return res.status(404).send({ error: 'Flashcard set not found or unauthorized' });
        }

        res.send({ message: 'Flashcard set updated successfully', set: updatedSet });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Route to serve the dashboard page
app.get('/dashboard/:email', (req, res) => {
    const { email } = req.params;
    if (req.session.user && req.session.user.email === email) {
        console.log(`Serving dashboard for user: email=${email}`); // Log dashboard access
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        console.log(`Unauthorized access attempt to dashboard: email=${email}`); // Log unauthorized access
        res.status(401).send('Unauthorized');
    }
});

// Route to get a flashcard set by ID
app.get('/flashcards/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const flashcardSet = await FlashcardSet.findOne({
            _id: req.params.id,
            user: req.session.user._id, // Ensure the user owns the set
        });

        if (!flashcardSet) {
            return res.status(404).send({ error: 'Flashcard set not found or unauthorized' });
        }

        res.send(flashcardSet);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
