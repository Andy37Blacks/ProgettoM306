/*

https://www.youtube.com/watch?v=b1ULt_No3IY
https://rhymbil.netlify.app/

*/

// Your web app's Firebase configuration
/*

https://www.youtube.com/watch?v=b1ULt_No3IY
https://rhymbil.netlify.app/

*/

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCwtVPPS0Qx17_GsMed-nC6DoBdPMnc3xQ",
    authDomain: "prova-firebase-m306.firebaseapp.com",
    databaseURL: "https://prova-firebase-m306-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "prova-firebase-m306",
    storageBucket: "prova-firebase-m306.appspot.com",
    messagingSenderId: "43569190876",
    appId: "1:43569190876:web:43568120f0fd14e4c56119"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Initialize variables
  const auth = firebase.auth();
  const database = firebase.database();
  
  // Set up our register function
  function register() {
    // Get all our input fields
    username = document.getElementById('username').value;
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;
  
    // Validate input fields
    if (validate_field(username) == false || validate_email(email) == false || validate_password(password) == false) {
      alert('Email or Password is Outta Line!!');
      return;
    }
  
    // Move on with Auth
    auth.createUserWithEmailAndPassword(email, password)
      .then(function () {
        // Declare user variable
        var user = auth.currentUser;
  
        // Add this user to Firebase Database
        var database_ref = database.ref();
  
        // Create User data
        var user_data = {
          username: username,
          email: email,
          username: username,
          last_login: Date.now()
        };
  
        // Push to Firebase Database
        database_ref.child('users/' + user.uid).set(user_data);
  
        // DOne
        alert('User Created!!');
      })
      .catch(function (error) {
        // Firebase will use this to alert of its errors
        var error_code = error.code;
        var error_message = error.message;
  
        alert(error_message);
      })
  }
    function login () {
      // Get all our input fields
      email = document.getElementById('email').value
      password = document.getElementById('password').value
    
      // Validate input fields
      if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password is Outta Line!!')
        return
        // Don't continue running the code
      }
    
      auth.signInWithEmailAndPassword(email, password)
      .then(function() {
        // Declare user variable
        var user = auth.currentUser
    
        // Add this user to Firebase Database
        var database_ref = database.ref()
    
        // Create User data
        var user_data = {
          last_login : Date.now()
        }
    
        // Push to Firebase Database
        database_ref.child('users/' + user.uid).update(user_data)
    
        // DOne
        alert('User Logged In!!')
    
      })
      .catch(function(error) {
        // Firebase will use this to alert of its errors
        var error_code = error.code
        var error_message = error.message
    
        alert(error_message)
      })
    }
    
    
    
    
    // Validate Functions
    function validate_email(email) {
      expression = /^[^@]+@\w+(\.\w+)+\w$/
      if (expression.test(email) == true) {
        // Email is good
        return true
      } else {
        // Email is not good
        return false
      }
    }
    
    function validate_password(password) {
      // Firebase only accepts lengths greater than 6
      if (password < 6) {
        return false
      } else {
        return true
      }
    }
    
    function validate_field(field) {
      if (field == null) {
        return false
      }
    
      if (field.length <= 0) {
        return false
      } else {
        return true
      }
    }