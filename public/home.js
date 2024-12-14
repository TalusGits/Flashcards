document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const dropdown = document.getElementById('dropdown');
    const userNameSpan = document.getElementById('user-name');
    const flashcardSetsContainer = document.querySelector('.flashcard-sets');

    // Toggle dropdown visibility
    plusButton.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!plusButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Fetch email from URL parameters
    const email = window.location.pathname.split('/dashboard/')[1];

    // Fetch user data dynamically
    fetch(`/user/${email}`)
        .then(response => {
            if (!response.ok) throw new Error('User not found');
            return response.json();
        })
        .then(user => {
            // Update the UI with the user's name
            userNameSpan.textContent = user.name;

            // Populate flashcard sets
            const flashcardSets = user.progress; // Assuming 'progress' contains flashcard sets
            for (const setName in flashcardSets) {
                const flashcardDiv = document.createElement('div');
                flashcardDiv.classList.add('flashcard');
                flashcardDiv.textContent = setName;
                flashcardDiv.addEventListener('click', () => {
                    // Handle flashcard set click
                    console.log(`Clicked on ${setName}`);
                });
                flashcardSetsContainer.appendChild(flashcardDiv);
            }
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            document.querySelector('h1').textContent = 'Welcome, User!';
        });
});
