document.addEventListener('DOMContentLoaded', () => {
    const flashcardDiv = document.getElementById('flashcard');
    const toggleButton = document.getElementById('toggle-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const doneButton = document.getElementById('done-button');

    let flashcards = [];
    let currentIndex = 0;
    let showingQuestion = true;

    // Fetch flashcards data (replace '/api/flashcards' with your actual API endpoint)
    fetch('/api/flashcards')
        .then(response => response.json())
        .then(data => {
            flashcards = data;
            if (flashcards.length > 0) {
                displayFlashcard();
            } else {
                flashcardDiv.textContent = 'No flashcards available.';
            }
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
            flashcardDiv.textContent = 'Error loading flashcards.';
        });

    function displayFlashcard() {
        const currentCard = flashcards[currentIndex];
        flashcardDiv.textContent = showingQuestion ? currentCard.question : currentCard.answer;
    }

    toggleButton.addEventListener('click', () => {
        showingQuestion = !showingQuestion;
        displayFlashcard();
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
        showingQuestion = true;
        displayFlashcard();
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % flashcards.length;
        showingQuestion = true;
        displayFlashcard();
    });

doneButton.addEventListener('click', async () => {
    try {
        // Fetch session data to get user info
        const response = await fetch('/session-check');
        const data = await response.json();

        if (data.loggedIn && data.user && data.user.email) {
            const userEmail = encodeURIComponent(data.user.email);
            window.location.href = `/dashboard/${userEmail}`;
        } else {
            alert('Session expired or user not logged in.');
            window.location.href = '/login'; // Redirect to login page or appropriate route
        }
    } catch (error) {
        console.error('Error fetching session data:', error);
        alert('An error occurred. Please try again.');
    }
});

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            toggleButton.click();
        } else if (event.code === 'ArrowLeft') {
            prevButton.click();
        } else if (event.code === 'ArrowRight') {
            nextButton.click();
        }
    });
});
