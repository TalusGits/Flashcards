document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const dropdown = document.getElementById('dropdown');
    const userNameSpan = document.getElementById('user-name');
    const flashcardSetsContainer = document.getElementById('flashcard-sets');
    const flashcardSetTemplate = document.getElementById('flashcard-set-template').content;

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

    // Function to fetch and render flashcard sets
    const fetchAndRenderFlashcardSets = () => {
        // Clear existing flashcard sets
        flashcardSetsContainer.innerHTML = '';

        // Fetch session data to get user info
        fetch('/session-check')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn && data.user) {
                    const email = data.user.email;
                    userNameSpan.textContent = data.user.name;

                    // Fetch flashcard sets for the user
                    fetch(`/flashcards?email=${encodeURIComponent(email)}`)
                    .then(response => response.json())
                    .then(flashcardSets => {
                        flashcardSets.forEach(set => {
                            const flashcardSetElement = document.importNode(flashcardSetTemplate, true);
                            flashcardSetElement.querySelector('.set-name').textContent = set.name;
                        
                            // Handle the view count for published sets
                            if (set.published) {
                                const viewCountElement = flashcardSetElement.querySelector('.view-count');
                                if (viewCountElement) {
                                    viewCountElement.textContent = `Views: ${set.viewers || 0}`;
                                }
                            } else {
                                // Hide the view count for unpublished sets
                                const viewCountElement = flashcardSetElement.querySelector('.view-count');
                                if (viewCountElement) {
                                    viewCountElement.textContent = '';
                                }
                            }
                        
                            // Open set button functionality
                            flashcardSetElement.querySelector('.open-set-button').addEventListener('click', () => {
                                window.location.href = `/flashcards.html?setId=${set._id}`;
                            });
                        
                            // Edit button functionality
                            flashcardSetElement.querySelector('.edit-button').addEventListener('click', (event) => {
                                event.stopPropagation(); // Prevent triggering the open-set-button click
                                window.location.href = `/build.html?setId=${set._id}`;
                            });
                        
                            // Delete button functionality
                            flashcardSetElement.querySelector('.delete-button').addEventListener('click', (event) => {
                                event.stopPropagation(); // Prevent triggering the open-set-button click
                                if (confirm(`Are you sure you want to delete the flashcard set "${set.name}"?`)) {
                                    fetch(`/flashcards/${set._id}`, { method: 'DELETE' })
                                        .then(response => {
                                            if (response.ok) {
                                                fetchAndRenderFlashcardSets(); // Re-fetch and render sets after deletion
                                            } else {
                                                alert('Failed to delete the flashcard set.');
                                            }
                                        });
                                }
                            });
                        
                            flashcardSetsContainer.appendChild(flashcardSetElement);
                        });
                    });
                } else {
                    window.location.href = '/login';
                }
            })
            .catch(err => {
                console.error('Error fetching session data:', err);
                window.location.href = '/login';
            });
    };

    // Initial fetch and render of flashcard sets
    fetchAndRenderFlashcardSets();
});
