// Handle Google Login
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    // Send to your backend or decode the token
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
