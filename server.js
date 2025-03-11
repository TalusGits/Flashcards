const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const { FlashcardSet, User } = require('./db'); 
const path = require('path');
const morgan = require('morgan'); 
const app = express();
const PORT = process.env.PORT || 3000;

const uri = 'mongodb+srv://githubaccesselias:OmicronPersei8@cluster.zj9v7.mongodb.net/Flashcards?retryWrites=true&w=majority';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

const flashcardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const flashcardSetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cards: [flashcardSchema],
});

app.use(morgan('combined')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(
    session({
        secret: 'yourSecretKey', 
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, 
    })
);
//Express Static
// Serve static files correctly from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve specific HTML files only if they exist
app.get('/*.html', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Page not found');
        }
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // Fallback for SPA apps
});

//express static
app.post('/login', async (req, res) => {
    const { email, name } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name });
            await user.save();
        }

        console.log('User logged in:', user);

        req.session.user = { _id: user._id, email: user.email, name: user.name }; 
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

app.get('/session-check', (req, res) => {
    if (req.session.user) {
        console.log('Session check: user is logged in', req.session.user);
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        console.log('Session check: no user logged in'); 
        res.send({ loggedIn: false });
    }
});

app.post('/flashcards', async (req, res) => {
    try {
        const { name, cards } = req.body;

        if (!req.session.user) {
            return res.status(401).send({ error: 'User not logged in' });
        }

        const newSet = new FlashcardSet({
            name,
            cards,
            user: req.session.user._id,
        });

        await newSet.save();
        res.status(201).send({ message: 'Flashcard set created', set: newSet });
    } catch (error) {
        console.error('Error saving flashcard set:', error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/flashcards', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send({ error: 'User not logged in' });
        }

        const sets = await FlashcardSet.find({ user: req.session.user._id });
        res.send(sets);
    } catch (error) {
        console.error('Error retrieving flashcard sets:', error);
        res.status(500).send({ error: error.message });
    }
});

app.delete('/flashcards/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const deletedSet = await FlashcardSet.findOneAndDelete({
            _id: req.params.id,
            user: req.session.user._id, 
        });

        if (!deletedSet) {
            return res.status(404).send({ error: 'Flashcard set not found or unauthorized' });
        }

        res.send({ message: 'Flashcard set deleted', set: deletedSet });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.put('/flashcards/:id', async (req, res) => {
    try {
        const setId = req.params.id;
        const { name, cards } = req.body;

        const set = await FlashcardSet.findById(setId);
        if (!set) {
            return res.status(404).send({ error: 'Flashcard set not found.' });
        }

        set.name = name;
        set.cards = cards;

        await set.save();
        res.send({ message: 'Flashcard set updated successfully.', set });
    } catch (error) {
        console.error('Error updating flashcard set:', error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/dashboard/:email', (req, res) => {
    const { email } = req.params;
    if (req.session.user && req.session.user.email === email) {
        console.log(`Serving dashboard for user: email=${email}`);
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        console.log(`Unauthorized access attempt to dashboard: email=${email}`);
        res.status(401).send('Unauthorized');
    }
});

app.post('/publish/:id', async (req, res) => {
    try {
        const setId = req.params.id;
        const updatedSet = await FlashcardSet.findByIdAndUpdate(
            setId,
            { published: true },
            { new: true }
        );

        if (!updatedSet) {
            return res.status(404).send({ error: 'Flashcard set not found' });
        }

        res.send({ message: 'Set published successfully', set: updatedSet });
    } catch (error) {
        console.error('Error publishing flashcard set:', error);
        res.status(500).send({ error: error.message });
    }
});
app.get('/published-flashcards', async (req, res) => {
    try {
        const sets = await FlashcardSet.find({ published: true });
        res.send(sets);
    } catch (error) {
        console.error('Error retrieving published flashcard sets:', error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/view/:id', async (req, res) => {
    try {
        const setId = req.params.id;
        const set = await FlashcardSet.findById(setId);

        if (!set) {
            return res.status(404).send({ error: 'Flashcard set not found' });
        }

        if (!set.published) {
            return res.status(400).send({ error: 'Cannot increment views for unpublished flashcard sets.' });
        }

        set.viewers += 1;
        await set.save();

        res.send({ message: 'Viewer count updated', viewers: set.viewers });
    } catch (error) {
        console.error('Error updating viewer count:', error);
        res.status(500).send({ error: error.message });
    }
});
app.post('/duplicate-flashcard-set/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send({ error: 'User not logged in.' });
        }

        const setId = req.params.id;

        const originalSet = await FlashcardSet.findById(setId);
        if (!originalSet) {
            return res.status(404).send({ error: 'Flashcard set not found.' });
        }

        if (String(originalSet.user) === String(req.session.user._id)) {
            return res.status(403).send({ error: 'You cannot duplicate your own set.' });
        }

        const duplicatedSet = new FlashcardSet({
            name: `${originalSet.name} (Copy)`,
            cards: originalSet.cards,
            user: req.session.user._id,
            published: false,
        });

        await duplicatedSet.save();

        res.status(201).send(duplicatedSet);
    } catch (error) {
        console.error('Error duplicating flashcard set:', error);
        res.status(500).send({ error: 'Failed to duplicate flashcard set.' });
    }
});
app.get('/flashcards/:id', async (req, res) => {
    try {
        const setId = req.params.id;

        const set = await FlashcardSet.findById(setId).populate('user');
        if (!set) {
            return res.status(404).send({ error: 'Flashcard set not found' });
        }

        if (set.published || (req.session.user && String(set.user._id) === req.session.user._id)) {
            res.send(set);
        } else {
            res.status(403).send({ error: 'Access denied' });
        }
    } catch (error) {
        console.error('Error retrieving flashcard set:', error);
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Server is running on port ${PORT}`);
});

