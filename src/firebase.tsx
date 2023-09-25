
import { initializeApp } from "firebase/app";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, setDoc, getDocs, doc, getDoc, Timestamp, query } from "firebase/firestore";


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
export const db   = getFirestore(app);





//User Retrieval and Saving
export class User {
    active: boolean;
    address: string;
    dob: Timestamp;
    doc: Timestamp;
    first: string;
    last: string;
    role: string;
    suspendEndDate: Timestamp;
    suspendStartDate: Timestamp;
    email: string;
    password: string;

    constructor(parsedJson: any) {
        this.active = parsedJson.active;
        this.address = parsedJson.address;
        this.dob = parsedJson.dob;
        this.doc = parsedJson.doc;
        this.first = parsedJson.first;
        this.last = parsedJson.last;
        this.role = parsedJson.role;
        this.suspendEndDate = parsedJson.suspendEndDate;
        this.suspendStartDate = parsedJson.suspendStartDate;
        this.email = parsedJson.email;
        this.password = parsedJson.password;
    }
}
export class UserDoc {
    username: string;
    userData: User;
    constructor(username: string, userData: User) {
        this.username = username;
        this.userData = userData;
    }
}
//Returns the data at "docPath/id" converted from json to an object
export async function getUserDocAt(docPath: string, username: string): Promise<UserDoc> {
    const user = await Promise.resolve(getDoc(doc(db, docPath + "/" + username)));
    const userDoc = { username: username, userData: new User(JSON.parse(JSON.stringify(user.data()))) };
    return userDoc;
}
export async function getAllUserDocs(): Promise<UserDoc[]> {

    console.log("Retrieving Users...");

    const queryResults = await getDocs(query(collection(db, "users")));

    let userDocs: Array<UserDoc> = new Array();
    queryResults.forEach((userDoc) => {
        userDocs.push({ username: userDoc.id, userData: new User(JSON.parse(JSON.stringify(userDoc.data())))} );
    })
    console.log("Users Retrieved!");
    return userDocs;
}
//Appends Object to doc at "docPath/id"
//Overwriting object completely if overwrite is true
export async function saveUserDoc(userDoc: UserDoc) {
    const retrievedDoc = await doc(db, "users/" + userDoc.username);
    const genericUserDataObj: object = { ...userDoc.userData };
    setDoc(retrievedDoc, genericUserDataObj, { merge: true });
}

onAuthStateChanged(auth,user => {
  if(user != null) {
    console.log('logged in!');
  } else {
    console.log('No user');
  }
});


