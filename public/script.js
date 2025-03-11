window.onload = function () {
    fetch('/session-check')
        .then((res) => res.json())
        .then((data) => {
            if (data.loggedIn) {
                window.location.href = `/dashboard/${data.user.email}`;
            }
        })
        .catch((error) => console.error('Session check failed:', error));

    google.accounts.id.initialize({
        client_id: "370531956593-8oo43fa8djna629c31qkt2u0fgpk040k.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
        document.getElementById("google-login"),
        { theme: "outline", size: "large" }
    );
};

function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential); 
    console.log("User Info:", data);

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name }),
    })
        .then((res) => res.json())
        .then(() => {
            window.location.href = `/dashboard/${data.email}`;
        })
        .catch((error) => {
            console.error("Login failed:", error);
        });
}
