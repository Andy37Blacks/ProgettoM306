import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase, ref, push, set, onChildAdded, orderByChild, query } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

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
const database = getDatabase(app);

const mesi = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

let myName = null;
let profilePicture = null;

onAuthStateChanged(auth, (user) => {
    if (!user || !user.emailVerified) {
        alert("Devi effettuare il login e verificare la tua email per accedere a tutte le funzionalità della chat.");
        myName = null;
        profilePicture = null;
        document.getElementById("submit").disabled = true;  // Disabilita l'invio di messaggi
    } else {
        // Assegna il nome e la foto del profilo dell'utente, se non disponibili usa dei valori predefiniti
        myName = user.displayName || "Anonimo"; 
        profilePicture = user.photoURL || "user_default.jpg"; 
        
        document.getElementById("submit").disabled = false;  // Abilita l'invio dei messaggi

        // Carica i messaggi e aggiorna ogni ora
        loadMessages();
        setInterval(loadMessages, 60 * 60 * 1000);  // Ricarica i messaggi ogni ora
    }
});


var text = "";

document.getElementById('text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); //Previene il comportamento del tasto premuto sul textarea
        text = document.getElementById('text').value.trim();
        if (text) {
            document.getElementById('submit').click();
            document.getElementById('text').value = ""; 
        }
    }
});

let fileData = "";

document.getElementById('submit').addEventListener('click', () => {
    const user = auth.currentUser;

    text = document.getElementById('text').value.trim();
    text = text.replace(/\n/g, "<br>"); // Gestisci ritorni a capo

    const date = new Date();
    const monthName = mesi[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    const timeStamp = `${monthName} ${day} - ${hours}:${minutes}`;
    const id = push(ref(database, 'message')).key;
    const timeStampUnix = Date.now();  // Aggiungi il timestamp UNIX in millisecondi

    if (text) {
        set(ref(database, 'message/' + id), {
            name: user.displayName || "Anonimo", // Usa il nome utente o un valore predefinito
            text: text,
            profilePicture: user.photoURL || "user_default.jpg", // Usa una foto predefinita se non disponibile quella dell' utente.
            file: fileData || "",
            time: timeStamp,
            timeUnix: timeStampUnix // Salva il timestamp UNIX  --> Cercato sul web e chiesto a chatgpt per gestire l' eliminazione dei messaggi dopo 1 settimana
        }).then(() => {
            document.getElementById('text').value = "";
            fileData = "";
            dropzone.removeAllFiles();
        }).catch((error) => {
            console.error("Errore nella scrittura nel database:", error);
        });
    }
});

function loadMessages() {
    const messagesRef = query(ref(database, 'message/'), orderByChild('timeUnix'));  // Ordina i messaggi per timeUnix --> Cercato sul web e chiesto a chatgpt per gestire l' eliminazione dei messaggi dopo 1 settimana
    onChildAdded(messagesRef, (data) => {
        const messageData = data.val();
        const messageElement = document.createElement('div');

        //Cambia il nome della classe in base all' autore del messaggio così da potere settare il css per mettere il div del messaggio 
        messageElement.className = 'message ' + (messageData.name === myName ? 'sent' : 'received'); 
        const timeClass = messageData.name === myName ? 'right' : 'left';

        messageElement.innerHTML = `
            <div class="message-content">
                <img id="pic" src="${messageData.profilePicture}">
                <span id="username" class="username">${messageData.name}:</span>
                ${messageData.file.startsWith('data:image/') ? `<img id="message-image" class="message-image" src="${messageData.file}" alt="Uploaded Image"/>` : ""}
                ${messageData.file.startsWith('data:audio/') ? `<audio id="message-audio" controls>
                    <source src="${messageData.file}" type="audio/mpeg">
                </audio>` : ""}
            </div>
            <div class="text">${messageData.text}</div>
            <p class="timestamp ${timeClass}">${messageData.time}</p>
        `;

        document.getElementById('messages').appendChild(messageElement);
        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    });
}

//https://www.dropzone.dev
//https://stackoverflow.com/questions/52663757/converting-dropzone-file-object-to-base64-string
Dropzone.autoDiscover = false;
const dropzone = new Dropzone("#fileDropzone", {
    addRemoveLinks: true,
    dictRemoveFile: "Remove file",
    maxFiles: 1,
    acceptedFiles: "image/*,audio/*", 
    init: function () {
        this.on("addedfile", (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (file.status == 'uploading') {
                    fileData = e.target.result;  // Salva il contenuto Base64
                } else {
                    alert("Puoi inserire solo un file alla volta!!!");
                    dropzone.removeAllFiles();
                }
            };
            reader.readAsDataURL(file);
        });

        this.on("removedfile", (file) => {
            if (file.status == 'error') {
                fileData = "";  // Rimuove il file corrente
            }
        });
    },
});

function logout() {
    sessionStorage.removeItem("myName");
    sessionStorage.removeItem("profilePicture");
    myName = null;
    profilePicture = null;
    window.location.replace("/");  // Rimanda alla pagina di login
}
document.getElementById("logout-button").addEventListener("click", logout);
