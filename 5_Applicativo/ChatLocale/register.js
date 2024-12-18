import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Configurazione di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCwtVPPS0Qx17_GsMed-nC6DoBdPMnc3xQ",
  authDomain: "prova-firebase-m306.firebaseapp.com",
  databaseURL: "https://prova-firebase-m306-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "prova-firebase-m306",
  storageBucket: "prova-firebase-m306.appspot.com",
  messagingSenderId: "43569190876",
  appId: "1:43569190876:web:43568120f0fd14e4c56119"
};

// Inizializzazione dell'app Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Funzione di registrazione
window.register = register;

function register() {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validazione dei campi
  if (!validate_field(username) || !validate_email(email) || !validate_password(password)) {
    alert('Per favore, inserisci dati validi.');
    return;
  }

  // Creazione dell'utente con email e password
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user; 

      // Imposta displayName e invia email di verifica
      updateProfile(user, { displayName: username })
        .then(() => {
          sendEmailVerification(user)
            .then(() => {
              alert('Email di verifica inviata. Controlla la tua casella di posta.');

              // Salva i dati dell'utente in Firestore
              const userData = {
                username,
                email,
                verified: false,
                last_login: serverTimestamp(), // Usa serverTimestamp per gestire la data
              };

              // Salva i dati su Firestore
              setDoc(doc(firestore, 'users', user.uid), userData)
                .then(() => {
                  auth.signOut(); // Logout automatico dopo la registrazione
                  window.location.replace("index.html"); // Reindirizza alla pagina di login
                })
                .catch((error) => {
                  console.error('Errore durante il salvataggio in Firestore:', error.message);
                  alert('Errore: ' + error.message);
                });
            })
            .catch((error) => {
              console.error('Errore nell\'invio dell\'email di verifica:', error.message);
              alert('Errore: ' + error.message);
            });
        })
        .catch((error) => {
          console.error('Errore nell\'aggiornamento del profilo:', error.message);
          alert('Errore: ' + error.message);
        });
    })
    .catch((error) => {
      console.error('Errore nella registrazione:', error.message);
      alert('Errore: ' + error.message);
    });
}

// Funzioni di validazione
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
