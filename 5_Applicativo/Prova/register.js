//Configurazione di Firebase 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

var firebaseConfig = {
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
const firestore = firebase.firestore();

// Funzione di registrazione
function register() {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validazione dei campi
  if (!validate_field(username) || !validate_email(email) || !validate_password(password)) {
    alert('Per favore, inserisci dati validi.');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password) //Serve a creare un utente nel Firebase Authentication
    .then(() => {
      const user = auth.currentUser; 

      // Imposta displayName e invia email di verifica
      return user.updateProfile({ displayName: username })
        .then(() => {
          user.sendEmailVerification() //Serve a mandare tramite email la verificazione del account 
            .then(() => {
              alert('Email di verifica inviata. Controlla la tua casella di posta.');

              // Salva i dati dell'utente in Firestore
              const userData = {
                username,
                email,
                verified: false,
                last_login: firebase.firestore.FieldValue.serverTimestamp(), //chiesto a chatgpt per gestire  l'ultimo login 
              };

              firestore.collection('users').doc(user.uid).set(userData);

              auth.signOut(); // Logout automatico dopo la registrazione
              window.location.replace("/"); // Reindirizza alla pagina di login
            });
        });
    })
    .catch((error) => {
      console.error('Errore nella registrazione:', error.message);
      alert('Errore: ' + error.message);
    });
}

/* Funzione di login
function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
 
  if (!validate_email(email) || !validate_password(password)) {
    alert('Email o password non validi.');
    return;
  }
 
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
 
      if (!user.emailVerified) {
        alert('Per favore verifica la tua email prima di accedere.');
        auth.signOut();
      } else {
        // Aggiorna l'ultimo login in Firestore
        const userRef = firestore.collection('users').doc(user.uid);
        userRef.update({ last_login: firebase.firestore.FieldValue.serverTimestamp() });
 
        window.location.replace("/"); // Reindirizza alla dashboard
      }
    })
    .catch((error) => {
      console.error('Errore nel login:', error.message);
      alert('Errore: ' + error.message);
    });
}*/

// Funzioni di validazione --> chiesto a chatgpt per la regular expression
function validate_email(email) {
  const expression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6; // Lunghezza minima richiesta da Firebase
}

function validate_field(field) {
  if (!field || field.trim().length === 0) {
    return false;
  } else {
    return true;
  }
}
