const mongoose = require('mongoose');

// MongoDB connection
const uri = 'mongodb+srv://githubaccesselias:OmicronPersei8@cluster.zj9v7.mongodb.net/Flashcards?retryWrites=true&w=majority'; // Replace with your actual connection string
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Define the flashcard schema
const flashcardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

// Define the flashcard set schema
const flashcardSetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cards: [flashcardSchema],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
});

// Define the user schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
});

// Create models
const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);
const User = mongoose.model('User', userSchema);

// Export models
module.exports = { FlashcardSet, User };
