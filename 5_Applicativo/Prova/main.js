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

let imageData = "";
let audioData = "";
document.getElementById('submit').addEventListener('click', (e) => {
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
        image: imageData || "", // Invia l'immagine solo se presente
        audio: audioData || "",
        time: timeStamp
    }).then(() => {
        document.getElementById('text').value = "";
        document.getElementById('upload').value = "";
        imageData = ""; // Reset dell'immagine dopo l'invio
        audioData = "";
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

document.getElementById("image-upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageData = e.target.result; // Salva l'immagine come Base64
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("audio-upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            audioData = e.target.result; // Salva l'audio come Base64
        };
        reader.readAsDataURL(file);
    }
});

function loadMessages() {
    const messagesRef = ref(database, 'message/');
    onChildAdded(messagesRef, (data) => {
        const messageData = data.val();
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + (messageData.name === myName ? 'sent' : 'received');
        const timeClass = messageData.name === myName ? 'right' : 'left';

        //https://stackoverflow.com/questions/980855/inputting-a-default-image-in-case-the-src-attribute-of-an-html-img-is-not-vali
        messageElement.innerHTML = `
            <div class="message-content">
                <img id="pic" src="${messageData.profilePicture}">
                <span id="username" class="username">${messageData.name}:</span>
                ${messageData.image ? ` <img id="message-image" class="message-image" src="${messageData.image}"/>` : ""}
                ${messageData.audio ? ` <audio controls>
                                            <source src="${messageData.audio}" type="audio/mp3">
                                        </audio>` : ""}
            </div>
            <div class="text">${messageData.text}</div>
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
}*/
