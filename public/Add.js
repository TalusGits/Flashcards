document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('published-sets');
    const backButton = document.getElementById('back-button'); // Select the Back button

    // Back button functionality
    backButton.addEventListener('click', () => {
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

    try {
        const response = await fetch('/published-flashcards');
        if (!response.ok) throw new Error('Failed to fetch published flashcards.');

        const sets = await response.json();
        if (sets.length === 0) {
            container.innerHTML = '<p>No published flashcard sets available.</p>';
            return;
        }

        sets.forEach(set => {
            const setDiv = document.createElement('div');
            setDiv.classList.add('published-set');
            setDiv.innerHTML = `
                <h2>${set.name}</h2>
                <p>Viewers: <span>${set.viewers || 0}</span></p>
            `;

            // Increment views and redirect to the game version
            setDiv.addEventListener('click', async () => {
                try {
                    const viewResponse = await fetch(`/view/${set._id}`, { method: 'POST' });
                    if (!viewResponse.ok) throw new Error('Failed to update viewer count.');

                    const viewData = await viewResponse.json();
                    setDiv.querySelector('span').textContent = viewData.viewers; // Update view count dynamically

                    // Redirect to game version
                    window.location.href = `/flashcards.html?setId=${set._id}`;
                } catch (error) {
                    console.error('Error updating views:', error);
                    alert('Failed to open flashcard set.');
                }
            });

            container.appendChild(setDiv);
        });
    } catch (error) {
        console.error('Error loading published flashcard sets:', error);
        alert('Failed to load flashcards.');
    }
});
