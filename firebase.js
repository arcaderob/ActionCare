// Import the functions you need from the SDKs you need
import * as firebase from "firebase";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgcy51eOy05yIi0K6Ak3vLaa0edSTP-ns",
  authDomain: "actioncare-72057.firebaseapp.com",
  projectId: "actioncare-72057",
  storageBucket: "actioncare-72057.appspot.com",
  messagingSenderId: "78033086337",
  appId: "1:78033086337:web:54218919534bc6fe256a80"
};

// Initialize Firebase
let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()

export { auth };