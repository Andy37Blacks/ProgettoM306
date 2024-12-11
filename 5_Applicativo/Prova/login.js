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

console.log(sessionStorage.getItem("myName"));//https://www.w3schools.com/jsref/prop_win_sessionstorage.asp
console.log(sessionStorage.getItem("profilePicture"));//https://www.w3schools.com/jsref/prop_win_sessionstorage.asp

if(!sessionStorage.getItem("myName")){
    googleLogin.addEventListener("click", function () {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                myName = user.displayName;
                profilePicture = user.photoURL;
    
                alert("Accesso effettuato con " + user.email);
                document.getElementById("google-login-button").disabled = true;
                document.getElementById("login_div").style.visibility = 'hidden';
    
                sessionStorage.setItem("myName", myName);
                sessionStorage.setItem("profilePicture" , profilePicture);
                
                window.location.replace("/chat.html"); //https://www.w3schools.com/js/js_window_location.asp
            })
            .catch((error) => {
                console.error("Sign-in error:", error.code, error.message);
            });
    });
}
else{
    window.location.replace("/chat.html"); //https://www.w3schools.com/js/js_window_location.asp
}