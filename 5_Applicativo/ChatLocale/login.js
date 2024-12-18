//Configurazione di Firebase 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCwtVPPS0Qx17_GsMed-nC6DoBdPMnc3xQ",
    authDomain: "prova-firebase-m306.firebaseapp.com",
    databaseURL: "https://prova-firebase-m306-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "prova-firebase-m306",
    storageBucket: "prova-firebase-m306.appspot.com",
    messagingSenderId: "43569190876",
    appId: "1:43569190876:web:43568120f0fd14e4c56119"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.languageCode = 'it';
const provider = new GoogleAuthProvider();

const database = getDatabase(app);


const googleLoginButton = document.getElementById("google-login-button");
const emailLoginButton = document.getElementById("login_button");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
let myName = "";
let profilePicture = "";

// Gestione login con Google
if (!sessionStorage.getItem("myName")) {
    googleLoginButton.addEventListener("click", function () {
        signInWithPopup(auth, provider) // Funzione di Firebase che permette di fare login con un account di google
            .then((result) => {
                const user = result.user;
                myName = user.displayName;
                profilePicture = user.photoURL;

                alert("Accesso effettuato con " + user.email);

                // Salva i dati dell'utente nella sessione
                sessionStorage.setItem("myName", myName);
                sessionStorage.setItem("profilePicture", profilePicture);

                window.location.replace("/chat.html");
            })
            .catch((error) => {
                console.error("Sign-in error:", error.code, error.message);
            });
    });
} else {
    window.location.replace("/chat.html");
}

// Gestione login con email e password
emailLoginButton.addEventListener("click", function () {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!validate_email(email) || !validate_password(password)) {
        alert("Email o password non validi!");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Controlla se l'email è verificata
            if (!user.emailVerified) {
                alert('Devi verificare la tua email prima di accedere.');
                auth.signOut();
                return;
            }

            alert("Accesso effettuato con " + user.email);

            // Salva i dati dell'utente nella sessione
            sessionStorage.setItem("myName", user.displayName);
            sessionStorage.setItem("profilePicture", user.photoURL);

            window.location.replace("/chat.html");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Errore: " + errorMessage + "- Code:" + errorCode);
        });
});

// Funzioni di validazione --> chiesto a chatgpt per la regular expression
function validate_email(email) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
}

function validate_password(password) {
    return password.length >= 6;// Lunghezza minima richiesta da Firebase
}
