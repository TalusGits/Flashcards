function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential); // jwt_decode is now globally available
    console.log("User Info:", data);

    // Send user info to the backend
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name }),
    })
    .then((res) => res.json())
    .then(() => {
        // Redirect to the user's personalized page
        window.location.href = `/dashboard/${data.email}`;
    })
    .catch((error) => {
        console.error("Login failed:", error);
    });
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "370531956593-8oo43fa8djna629c31qkt2u0fgpk040k.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
        document.getElementById("google-login"),
        { theme: "outline", size: "large" }
    );
};
