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

const googleLogin = document.getElementById("google-login-button");
let myName = "";
let profilePicture = "";

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

let fileData = "";
document.getElementById('submit').addEventListener('click', () => {
    if (!myName) {
        alert("Devi essere loggato per accedere alla chat.");
        return;
    }

    const text = document.getElementById('text').value;
    const date = new Date();
    const monthName = mesi[date.getMonth()];
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeStamp = `${monthName} ${day} - ${hours}:${minutes}`;
    const id = push(ref(database, 'message')).key;

    set(ref(database, 'message/' + id), {
        name: myName,
        text: text,
        profilePicture: profilePicture,
        file: fileData || "", 
        time: timeStamp
    }).then(() => {
        document.getElementById('text').value = "";
        fileData = ""; 
        dropzone.removeAllFiles(); // Ripulisce la Dropzone --> Preso da ChatGPT
    }).catch((error) => {
        console.error("Errore nella scrittura nel database:", error);
    });
});




document.getElementById('text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Previene il comportamento dell' andare a capo
        const text = document.getElementById('text').value.trim(); // Serve a rimuovere gli spazi prima e dopo il text.
        if (text) {
            document.getElementById('submit').click();
            document.getElementById('text').value = "";
        }
    }
});

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

Dropzone.autoDiscover = false;
const arrayFiles = [];
const dropzone = new Dropzone("#fileDropzone", {
    addRemoveLinks: true,
    dictRemoveFile: "Remove file",
    maxFiles: 1,
    acceptedFiles: "image/*,audio/*", //Chiesto a ChatGPT per i file accettati
    init: function () {
        this.on("addedfile", (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if(file.status == 'uploading'){
                    fileData = e.target.result; // Salva il contenuto Base64
                    console.log("File caricato (Base64):", fileData);
                }else{
                    alert("Puoi inserire solo un file alla volta!!!");
                    dropzone.removeAllFiles();
                }
            };
            reader.readAsDataURL(file);
        });

        this.on("removedfile", (file) => {
            if(file.status == 'error'){
                fileData = ""; // Rimuove il file corrente
            }
        });
    },
});


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
}*/
