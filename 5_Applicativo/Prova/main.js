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

document.getElementById('submit').addEventListener('click', (e) => {
    if (!myName) {
        alert("Devi essere loggato per accedere alla chat.");
        return;
    }

    const text = document.getElementById('text').value;
    const id = push(ref(database, 'text')).key;

    set(ref(database, 'text/' + id), {
        name: myName,
        text: text,
        profilePicture: profilePicture
    }).then(() => {
        document.getElementById('text').value = ""; 
    }).catch((error) => {
        console.error("Errore nella scrittura nel database:", error);
    });
});

document.getElementById('text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        const text = document.getElementById('text').value.trim(); 
        if (text) {
            document.getElementById('submit').click();
            document.getElementById('text').value = ""; 
        }
    }
});



function loadMessages() {
    const messagesRef = ref(database, 'text/');
    onChildAdded(messagesRef, (data) => {
        const messageData = data.val();
        if (myName) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message ' + (messageData.name === myName ? 'sent' : 'received');
            //messageElement.innerHTML = `${messageData.name}: ${messageData.text}`;
            messageElement.innerHTML = `<img id= "pic" src="${messageData.profilePicture}"></img>${messageData.name}: ${messageData.text}`;
            document.getElementById('messages').appendChild(messageElement);
            document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; // Auto-scroll
        }
    });
}

/* https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL */
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
  
  