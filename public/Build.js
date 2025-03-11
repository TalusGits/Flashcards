document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('flashcard-form');
    const addPairButton = document.getElementById('add-pair');
    const publishButton = document.createElement('button'); 
    publishButton.type = 'button';
    publishButton.textContent = 'Publish';
    publishButton.id = 'publish-set';
    form.appendChild(publishButton); 
    let pairCount = 0;

    const addQuestionAnswerPair = (question = '', answer = '') => {
        pairCount++;
        const qaPairDiv = document.createElement('div');
        qaPairDiv.classList.add('qa-pair');

        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        const questionLabel = document.createElement('label');
        questionLabel.setAttribute('for', `question-${pairCount}`);
        questionLabel.textContent = 'Question:';
        const questionTextarea = document.createElement('textarea');
        questionTextarea.id = `question-${pairCount}`;
        questionTextarea.name = `question-${pairCount}`;
        questionTextarea.rows = 3;
        questionTextarea.required = true;
        questionTextarea.value = question;
        questionDiv.appendChild(questionLabel);
        questionDiv.appendChild(questionTextarea);

        const answerDiv = document.createElement('div');
        answerDiv.classList.add('answer');
        const answerLabel = document.createElement('label');
        answerLabel.setAttribute('for', `answer-${pairCount}`);
        answerLabel.textContent = 'Answer:';
        const answerTextarea = document.createElement('textarea');
        answerTextarea.id = `answer-${pairCount}`;
        answerTextarea.name = `answer-${pairCount}`;
        answerTextarea.rows = 3;
        answerTextarea.required = true;
        answerTextarea.value = answer;
        answerDiv.appendChild(answerLabel);
        answerDiv.appendChild(answerTextarea);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            form.removeChild(qaPairDiv);
            logCurrentFlashcards(); 
        });

        qaPairDiv.appendChild(questionDiv);
        qaPairDiv.appendChild(answerDiv);
        qaPairDiv.appendChild(removeButton);

        form.insertBefore(qaPairDiv, addPairButton);

        logCurrentFlashcards(); 
    };

    const logCurrentFlashcards = () => {
        const flashcards = [];
        document.querySelectorAll('.qa-pair').forEach((qaPairDiv) => {
            const questionElement = qaPairDiv.querySelector('.question textarea');
            const answerElement = qaPairDiv.querySelector('.answer textarea');
            if (questionElement && answerElement) {
                const question = questionElement.value.trim();
                const answer = answerElement.value.trim();
                if (question || answer) {
                    flashcards.push({ question, answer });
                }
            }
        });
        console.log('Current flashcards:', flashcards);
    };

    addPairButton.addEventListener('click', () => addQuestionAnswerPair());

    const urlParams = new URLSearchParams(window.location.search);
    const setId = urlParams.get('setId');
    if (setId) {
        fetch(`/flashcards/${setId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch flashcard set data.');
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('set-name').value = data.name;

                const existingPairs = document.querySelectorAll('.qa-pair');
                existingPairs.forEach(pair => form.removeChild(pair));
                data.cards.forEach(card => {
                    addQuestionAnswerPair(card.question, card.answer);
                });
                logCurrentFlashcards();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while loading the flashcard set.');
            });
    } else {
        addQuestionAnswerPair();
    }

    const saveFlashcardSet = async (redirectToPublishing = false) => {
        const setName = document.getElementById('set-name').value.trim();
        if (!setName) {
            alert('Please enter a name for the flashcard set.');
            return;
        }

        const flashcards = [];
        document.querySelectorAll('.qa-pair').forEach((qaPairDiv) => {
            const questionElement = qaPairDiv.querySelector('.question textarea');
            const answerElement = qaPairDiv.querySelector('.answer textarea');
            if (questionElement && answerElement) {
                const question = questionElement.value.trim();
                const answer = answerElement.value.trim();
                if (question || answer) {
                    flashcards.push({ question, answer });
                }
            }
        });

        if (flashcards.length === 0) {
            alert('Please add at least one question-answer pair.');
            return;
        }

        const flashcardSet = { name: setName, cards: flashcards };

        try {
            const method = setId ? 'PUT' : 'POST';
            const endpoint = setId ? `/flashcards/${setId}` : '/flashcards';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flashcardSet),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error saving flashcards: ${errorData.error}`);
                return;
            }

            const result = await response.json();
            alert('Flashcard set saved successfully!');

            if (redirectToPublishing) {
                window.location.href = `/Publishing.html?setId=${result._id || setId}`;
            } else {
                const sessionResponse = await fetch('/session-check');
                const sessionData = await sessionResponse.json();

                if (sessionData.loggedIn && sessionData.user && sessionData.user.email) {
                    const userEmail = encodeURIComponent(sessionData.user.email);
                    window.location.href = `/home.html?email=${data.email}`;
                } else {
                    alert('Session expired or user not logged in.');
                    window.location.href = '/home.html';
                }
            }
        } catch (error) {
            console.error('Error saving flashcard set:', error);
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        saveFlashcardSet(false);
    });

    publishButton.addEventListener('click', () => {
        saveFlashcardSet(true);
    });
});
