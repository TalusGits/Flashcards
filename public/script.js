// Handle Google Login
function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential);
    console.log("User Info:", data);

    // Send user info to the backend
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name }),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        alert(`Welcome, ${data.user.name}!`);
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
