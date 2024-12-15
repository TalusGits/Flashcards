document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const setId = params.get('setId');

    // Redirect back if no set ID is found
    if (!setId) {
        alert('No flashcard set selected for publishing.');
        redirectToDashboard();
        return;
    }

    const setTitleElement = document.getElementById('set-title');
    const container = document.getElementById('flashcards-container');

    // Fetch the flashcard set and display it
    try {
        const response = await fetch(`/flashcards/${setId}`);
        if (!response.ok) throw new Error('Failed to fetch flashcard set.');

        const set = await response.json();
        setTitleElement.innerText = set.name;

        set.cards.forEach((card) => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.innerHTML = `
                <p><strong>Question:</strong> ${card.question}</p>
                <p><strong>Answer:</strong> ${card.answer}</p>
            `;
            container.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Error fetching flashcard set:', error);
        alert('Error loading flashcard set.');
        redirectToDashboard();
    }

    // Publish the set
    document.getElementById('publish-confirm').addEventListener('click', async () => {
        if (confirm('Are you sure? This will make your set publicly available.')) {
            try {
                const response = await fetch(`/publish/${setId}`, { method: 'POST' });
                if (!response.ok) throw new Error('Failed to publish flashcard set.');

                alert('Flashcard set published!');
                redirectToDashboard();
            } catch (error) {
                console.error('Error publishing set:', error);
                alert('Failed to publish flashcard set.');
            }
        }
    });

    // Cancel publishing and go back to the dashboard
    document.getElementById('cancel').addEventListener('click', redirectToDashboard);

    // Function to redirect to the dashboard
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
});