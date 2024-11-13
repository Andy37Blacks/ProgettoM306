import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase, set, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "prova-firebase-m306.firebaseapp.com",
    databaseURL: "https://prova-firebase-m306-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "prova-firebase-m306",
    storageBucket: "prova-firebase-m306.appspot.com",
    messagingSenderId: "43569190876",
    appId: "1:43569190876:web:43568120f0fd14e4c56119"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

let myName = "";
let profilePicture = "";

const googleLogin = document.getElementById("google-login-button");

googleLogin.addEventListener("click", function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            myName = user.displayName;
            profilePicture = user.photoURL;

            alert("Accesso effettuato con " + user.email);
            document.getElementById("google-login-button").disabled = true;
            document.getElementById("login_div").style.visibility = 'hidden';
            loadMessages();
        })
        .catch((error) => {
            console.error("Sign-in error:", error.code, error.message);
        });
});

// Caricamento immagine
let imageData = "";
document.getElementById("image-upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Invio messaggio
document.getElementById('submit').addEventListener('click', (e) => {
    if (!myName) {
        alert("Devi essere loggato per accedere alla chat.");
        return;
    }

    const text = document.getElementById('text').value;
    const date = new Date();
    const timeStamp = `${date.getHours()}:${date.getMinutes()}`;
    const id = push(ref(database, 'text')).key;

    set(ref(database, 'text/' + id), {
        name: myName,
        text: text,
        profilePicture: profilePicture,
        image: imageData || "", // Invia l'immagine solo se presente
        time: timeStamp
    }).then(() => {
        document.getElementById('text').value = "";
        document.getElementById('image-upload').value = "";
        imageData = ""; // Reset dell'immagine dopo l'invio
    }).catch((error) => {
        console.error("Errore nella scrittura nel database:", error);
    });
});

// Caricamento messaggi
function loadMessages() {
    const messagesRef = ref(database, 'text/');
    onChildAdded(messagesRef, (data) => {
        const messageData = data.val();
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + (messageData.name === myName ? 'sent' : 'received');
        const timeClass = messageData.name === myName ? 'right' : 'left';

        // Mostra testo e immagine (se presente)
        messageElement.innerHTML = `
            <div class="message-content">
                <img id="pic" src="${messageData.profilePicture}">
                <span class="username">${messageData.name}</span>: 
                <span class="text">${messageData.text}</span>
                ${messageData.image ? `<img class="message-image" src="${messageData.image}"/>` : ""}
            </div>
            <p class="timestamp ${timeClass}">${messageData.time}</p>
        `;

        document.getElementById('messages').appendChild(messageElement);
        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    });
}


/* https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
async function parseURI(d){
    var reader = new FileReader();
    reader.readAsDataURL(d);          
    return new Promise((res,rej)=> {
      reader.onload = (e) => {
        res(e.target.result)
      }
    })
  } 
  
async function getDataBlob(url){
    var res = await fetch(url);
    var blob = await res.blob();
    var uri = await parseURI(blob);
    return uri;
}
*/
