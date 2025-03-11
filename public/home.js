document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const dropdown = document.getElementById('dropdown');
    const userNameSpan = document.getElementById('user-name');
    const flashcardSetsContainer = document.getElementById('flashcard-sets');
    const flashcardSetTemplate = document.getElementById('flashcard-set-template').content;

    plusButton.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!plusButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });

    const fetchAndRenderFlashcardSets = () => {
        flashcardSetsContainer.innerHTML = '';

        fetch('/session-check')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn && data.user) {
                    const email = data.user.email;
                    userNameSpan.textContent = data.user.name;

                    fetch(`/flashcards?email=${encodeURIComponent(email)}`)
                    .then(response => response.json())
                    .then(flashcardSets => {
                        flashcardSets.forEach(set => {
                            const flashcardSetElement = document.importNode(flashcardSetTemplate, true);
                            flashcardSetElement.querySelector('.set-name').textContent = set.name;
                        
                            if (set.published) {
                                const viewCountElement = flashcardSetElement.querySelector('.view-count');
                                if (viewCountElement) {
                                    viewCountElement.textContent = `Views: ${set.viewers || 0}`;
                                }
                            } else {
                                const viewCountElement = flashcardSetElement.querySelector('.view-count');
                                if (viewCountElement) {
                                    viewCountElement.textContent = '';
                                }
                            }
                        
                            flashcardSetElement.querySelector('.open-set-button').addEventListener('click', () => {
                                window.location.href = `/flashcards.html?setId=${set._id}`;
                            });
                        
                            flashcardSetElement.querySelector('.edit-button').addEventListener('click', (event) => {
                                event.stopPropagation();
                                window.location.href = `/build.html?setId=${set._id}`;
                            });
                        
                            flashcardSetElement.querySelector('.delete-button').addEventListener('click', (event) => {
                                event.stopPropagation(); 
                                if (confirm(`Are you sure you want to delete the flashcard set "${set.name}"?`)) {
                                    fetch(`/flashcards/${set._id}`, { method: 'DELETE' })
                                        .then(response => {
                                            if (response.ok) {
                                                fetchAndRenderFlashcardSets();
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

    fetchAndRenderFlashcardSets();
});
