const mongoose = require('mongoose');

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
});

// Create the FlashcardSet model
const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

module.exports = FlashcardSet;
