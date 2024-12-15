document.addEventListener('DOMContentLoaded', () => {
    const flashcardDiv = document.getElementById('flashcard');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const revealButton = document.getElementById('reveal-button');
    const doneButton = document.getElementById('done-button');
    const setNameDiv = document.getElementById('set-name'); // For displaying the set name in the top-left corner

    let flashcards = [];
    let currentIndex = 0;
    let showingQuestion = true;

    // Function to display the current flashcard
    const displayFlashcard = () => {
        if (flashcards.length === 0) {
            flashcardDiv.textContent = 'No flashcards available.';
            return;
        }
        const currentCard = flashcards[currentIndex];
        flashcardDiv.textContent = showingQuestion ? currentCard.question : currentCard.answer;
    };

    // Fetch the flashcard set data and set name
    const fetchFlashcardSet = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const setId = urlParams.get('setId');
        if (!setId) {
            flashcardDiv.textContent = 'No flashcards available.';
            setNameDiv.textContent = 'Set Name: Unknown';
            return;
        }

        fetch(`/flashcards/${setId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch flashcard set data.');
                }
                return response.json();
            })
            .then(data => {
                // Set the flashcard set name
                setNameDiv.textContent = `Set Name: ${data.name}`;
                flashcards = data.cards;
                currentIndex = 0;
                showingQuestion = true;
                displayFlashcard();
            })
            .catch(error => {
                console.error('Error:', error);
                flashcardDiv.textContent = 'Failed to load flashcards.';
                setNameDiv.textContent = 'Set Name: Error';
            });
    };

    // Event listeners for button clicks
    revealButton.addEventListener('click', () => {
        showingQuestion = !showingQuestion;
        displayFlashcard();
        setActiveButton(revealButton);
    });

    nextButton.addEventListener('click', () => {
        if (flashcards.length > 0) {
            currentIndex = (currentIndex + 1) % flashcards.length;
            showingQuestion = true;
            displayFlashcard();
            setActiveButton(nextButton);
        }
    });

    prevButton.addEventListener('click', () => {
        if (flashcards.length > 0) {
            currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
            showingQuestion = true;
            displayFlashcard();
            setActiveButton(prevButton);
        }
    });

    doneButton.addEventListener('click', () => {
        // Fetch the user's email from the session
        fetch('/session-check')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn && data.user && data.user.email) {
                    const userEmail = encodeURIComponent(data.user.email);
                    window.location.href = `/dashboard/${userEmail}`;
                } else {
                    alert('Session expired or user not logged in.');
                    window.location.href = '/login'; // Redirect to login page or appropriate route
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
    });

    // Keyboard event listener
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                prevButton.click();
                break;
            case 'ArrowRight':
                nextButton.click();
                break;
            case ' ':
                event.preventDefault(); // Prevent default spacebar behavior (scrolling)
                revealButton.click();
                break;
        }
    });

    // Function to set the active button class
    const setActiveButton = (button) => {
        // Remove active class from all navigation buttons
        [prevButton, nextButton, revealButton].forEach(btn => btn.classList.remove('active'));
        // Add active class to the specified button
        button.classList.add('active');
        // Remove active class after a short delay
        setTimeout(() => button.classList.remove('active'), 200);
    };

    // Initialize the flashcards
    fetchFlashcardSet();
});
