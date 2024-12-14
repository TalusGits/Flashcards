const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
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

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

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
app.post('/login', (req, res) => {
    const { email, name } = req.body;
    console.log(`Login attempt: email=${email}, name=${name}`); // Log login attempt
    req.session.user = { email, name };
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err); // Log session save error
            return res.status(500).send({ error: 'Failed to save session' });
        }
        res.send({ message: 'Login successful', user: { email, name } });
    });
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
    try {
        const { name, cards } = req.body;
        console.log(`Saving flashcard set: name=${name}, cards=${JSON.stringify(cards)}`); // Log flashcard set data
        const newSet = new FlashcardSet({ name, cards });
        await newSet.save();
        res.status(201).send({ message: 'Flashcard set saved successfully', set: newSet });
    } catch (error) {
        console.error('Error saving flashcard set:', error); // Log error
        res.status(400).send({ error: error.message });
    }
});

// Route to get all flashcard sets
app.get('/flashcards', async (req, res) => {
    try {
        const sets = await FlashcardSet.find();
        console.log(`Retrieved flashcard sets: ${JSON.stringify(sets)}`); // Log retrieved sets
        res.send(sets);
    } catch (error) {
        console.error('Error retrieving flashcard sets:', error); // Log error
        res.status(500).send({ error: error.message });
    }

    const { setId } = req.params;
    if (req.session.user) {
        console.log(`Serving Flashcards page for set: ${setId}`); // Log access
        res.sendFile(path.join(__dirname, 'public', 'Flashcards.html'));
    } else {
        console.log(`Unauthorized access attempt to flashcard set: ${setId}`); // Log unauthorized access
        res.status(401).send('Unauthorized');
    }
});

// Route to delete a flashcard set
app.delete('/flashcards/:id', async (req, res) => {
    try {
        const deletedSet = await FlashcardSet.findByIdAndDelete(req.params.id);
        if (!deletedSet) {
            console.log(`Flashcard set not found: id=${req.params.id}`); // Log not found
            return res.status(404).send({ error: 'Flashcard set not found' });
        }
        console.log(`Deleted flashcard set: ${JSON.stringify(deletedSet)}`); // Log deleted set
        res.send({ message: 'Flashcard set deleted', set: deletedSet });
    } catch (error) {
        console.error('Error deleting flashcard set:', error); // Log error
        res.status(500).send({ error: error.message });
    }
});

// Route to update a flashcard set by ID
app.put('/flashcards/:id', async (req, res) => {
    try {
        const { name, cards } = req.body;
        console.log(`Updating flashcard set: id=${req.params.id}, name=${name}, cards=${JSON.stringify(cards)}`); // Log update data
        const updatedSet = await FlashcardSet.findByIdAndUpdate(
            req.params.id,
            { name, cards },
            { new: true, runValidators: true }
        );
        if (!updatedSet) {
            console.log(`Flashcard set not found: id=${req.params.id}`); // Log not found
            return res.status(404).send({ error: 'Flashcard set not found' });
        }
        res.send({ message: 'Flashcard set updated successfully', set: updatedSet });
    } catch (error) {
        console.error('Error updating flashcard set:', error); // Log error
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
    try {
        const flashcardSet = await FlashcardSet.findById(req.params.id);
        if (!flashcardSet) {
            return res.status(404).send({ error: 'Flashcard set not found' });
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
