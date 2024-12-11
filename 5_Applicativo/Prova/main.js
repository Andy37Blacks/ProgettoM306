import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
    getDatabase,
    set,
    ref,
    push,
    onChildAdded
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
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

let myName = sessionStorage.getItem("myName"); //https://www.w3schools.com/jsref/prop_win_sessionstorage.asp
let profilePicture = sessionStorage.getItem("profilePicture"); //https://www.w3schools.com/jsref/prop_win_sessionstorage.asp

const mesi = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
];


document.addEventListener('DOMContentLoaded', () => {
    // Controlla se l'utente è autenticato
    if (!myName) {
        alert("Devi effettuare il login per accedere alla chat.");
        window.location.replace("/"); 
    } else {
        checkOldMessages(); 
        setInterval(checkOldMessages, 60 * 60 * 1000); 
        loadMessages();
    }
});

var text = "";


document.getElementById('text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        text = document.getElementById('text').value.trim();
        if (text) {
            document.getElementById('submit').click();
            document.getElementById('text').value = ""; 
        }
    } else if (e.key === 'Enter' && e.shiftKey) {
        
    }
});



let fileData = "";
document.getElementById('submit').addEventListener('click', () => {
    if (!myName) {
        alert("Devi essere loggato per accedere alla chat.");
        window.location.replace("/"); //https://www.w3schools.com/js/js_window_location.asp
        return;
    }
    else {
        text = document.getElementById('text').value.trim();

        /* Preso da chatgpt per far si che quando si va a capo anche nel div dove viene inserito il testo bisogna cambirare 
        il \n con un <br> così da poter lasciare la formattazione come inserita dall' utente nel textarea.*/

        text = text.replace(/\n/g, "<br>");

        console.log(text);
        const date = new Date();
        let monthName = mesi[date.getMonth()];
        let day = date.getDate();

        let hours = "";
        if (date.getHours() < 10) {
            hours = "0" + date.getHours();
        }
        else {
            hours = date.getHours();
        }

        let minutes = "";
        if (date.getMinutes() < 10) {
            minutes = "0" + date.getMinutes();
        }
        else {
            minutes = date.getMinutes();
        }

        const timeStamp = `${monthName} ${day} - ${hours}:${minutes}`;
        const id = push(ref(database, 'message')).key;

        const timeStampUnix = Date.now(); // Aggiunge il timestamp UNIX in millisecondi

        if (text) {
            set(ref(database, 'message/' + id), {
                name: myName,
                text: text,
                profilePicture: profilePicture,
                file: fileData || "",
                time: timeStamp,
                timeUnix: timeStampUnix // Salva il timestamp UNIX
            }).then(() => {
                document.getElementById('text').value = "";
                fileData = "";
                dropzone.removeAllFiles();
            }).catch((error) => {
                console.error("Errore nella scrittura nel database:", error);
            });
        }

    }
});



function checkOldMessages() {
    const messagesRef = ref(database, 'message/');
    const oneWeekAgo = Date.now() -  7  * 24 * 60 * 60 * 1000; // 7 giorni in millisecondi

    onChildAdded(messagesRef, (data) => {
        const messageData = data.val();
        const messageKey = data.key;

        if (messageData.timeUnix < oneWeekAgo) {
            // Elimina il messaggio dal database
            set(ref(database, 'message/' + messageKey), null)
                .then(() => {
                    console.log(`Messaggio con ID ${messageKey} eliminato`);
                    window.location.replace("/chat.html");
                    
                })
                .catch((error) => {
                    console.error(`Errore nell'eliminazione del messaggio con ID ${messageKey}:`, error);
                });
        }
    });
}


function loadMessages() {
    const messagesRef = ref(database, 'message/');
    onChildAdded(messagesRef, (data) => {
        const messageData = data.val();
        const messageElement = document.createElement('div');
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


//https://docs.dropzone.dev/
Dropzone.autoDiscover = false;
const dropzone = new Dropzone("#fileDropzone", {
    addRemoveLinks: true,
    dictRemoveFile: "Remove file",
    maxFiles: 1,
    acceptedFiles: "image/*,audio/*", //Chiesto a ChatGPT per i file accettati
    init: function () {
        this.on("addedfile", (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (file.status == 'uploading') {
                    fileData = e.target.result; // Salva il contenuto Base64
                    console.log("File caricato (Base64):", fileData);
                } else {
                    alert("Puoi inserire solo un file alla volta!!!");
                    dropzone.removeAllFiles();
                }
            };
            reader.readAsDataURL(file);
        });

        this.on("removedfile", (file) => {
            if (file.status == 'error') {
                fileData = ""; // Rimuove il file corrente
            }
        });
    },
});

console.log(myName);
console.log(profilePicture);

function logout() {
    sessionStorage.removeItem("myName");
    sessionStorage.removeItem("profilePicture");
    myName = null;
    profilePicture = null;
    console.log(myName);
    console.log(profilePicture);
    window.location.replace("/");
}

document.getElementById("logout-button").addEventListener("click", logout);