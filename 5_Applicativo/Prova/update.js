import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"

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

const user = auth.currentUser;

function updateUserProfile(user) {
    const userName = user.displayName;
    const userEmail = user.email;
    const userProfilePicture = user.photoURL;

    document.getElementById("userName").textContent = userName;
    document.getElementById("userEmail").textContent = userEmail;
    document.getElementById("userProfilePicture").src = userProfilePicture;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        updateUserProfile(user);
        const uid = user.uid;
        return uid;
    }
    else {
        allert("Crea un account e loggati");
    }
});