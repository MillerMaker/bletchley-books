
import { initializeApp } from "firebase/app";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrCLNhq8LQSGrJB0zJZSvFN0k6dBJatxw",
  authDomain: "bletchlybooks.firebaseapp.com",
  projectId: "bletchlybooks",
  storageBucket: "bletchlybooks.appspot.com",
  messagingSenderId: "253154132376",
  appId: "1:253154132376:web:07edbc66bf3a72a92e2bed",
  measurementId: "G-YF1Q5YLRMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


onAuthStateChanged(auth,user => {
  if(user != null) {
    console.log('logged in!');
  } else {
    console.log('No user');
  }
});

