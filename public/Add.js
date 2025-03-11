document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('published-sets');
    const backButton = document.getElementById('back-button'); 

    backButton.addEventListener('click', redirectToDashboard);

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

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save to Dashboard';
            saveButton.classList.add('save-button');

            saveButton.addEventListener('click', async (event) => {
                event.stopPropagation(); 
                try {
                    const duplicateResponse = await fetch(`/duplicate-flashcard-set/${set._id}`, {
                        method: 'POST',
                    });

                    if (!duplicateResponse.ok) {
                        const errorData = await duplicateResponse.json();
                        throw new Error(errorData.error || 'Failed to save flashcard set to dashboard.');
                    }

                    alert('Flashcard set successfully saved to your dashboard!');
                    redirectToDashboard();
                } catch (error) {
                    console.error('Error duplicating flashcard set:', error);
                    alert(error.message);
                }
            });

            setDiv.appendChild(saveButton);

            setDiv.addEventListener('click', async () => {
                try {
                    const viewResponse = await fetch(`/view/${set._id}`, { method: 'POST' });
                    if (!viewResponse.ok) throw new Error('Failed to update viewer count.');

                    const viewData = await viewResponse.json();
                    setDiv.querySelector('span').textContent = viewData.viewers; 

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

async function redirectToDashboard() {
    try {
        const sessionResponse = await fetch('/session-check');
        const sessionData = await sessionResponse.json();

        if (sessionData.loggedIn && sessionData.user && sessionData.user.email) {
            const userEmail = encodeURIComponent(sessionData.user.email);
            window.location.href = `/dashboard/${userEmail}`;
        } else {
            alert('Session expired. Redirecting to login.');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error checking session:', error);
        window.location.href = '/login';
    }
}
