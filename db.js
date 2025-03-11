const mongoose = require('mongoose');

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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false }, 
    viewers: { type: Number, default: 0 }, 
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
});

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);
const User = mongoose.model('User', userSchema);

module.exports = { FlashcardSet, User };
