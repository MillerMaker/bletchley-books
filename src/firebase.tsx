
import { initializeApp } from "firebase/app";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, setDoc, getDocs, doc, getDoc, Timestamp, query, where, QuerySnapshot, DocumentData, DocumentSnapshot, deleteDoc, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs-react";
import { EventData } from "./components/EventLog";


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
export const db = getFirestore(app);




//Hash Function
export async function HashString(toHash: string) {
    //const salt = await bcrypt.genSalt(10); //We have to store salt with passwords if we want to use it
    const hashed = await bcrypt.hash(toHash, 10);

    //console.log("HASHED: " + hashed);
    return hashed;
}
//Returns whether a string contains an email
export function ContainsEmail(toCheck: string): boolean {
    const atIndex = toCheck.indexOf("@");
    const periodIndex = toCheck.indexOf(".");

    return (atIndex != -1 && periodIndex != -1 && periodIndex > atIndex);
}
const timezoneDiffMilli = new Date().getTimezoneOffset() * 60000; //Timezone difference from database in milliseconds
//Converts a timestamp to a string compatible with Date Input fields taking local time into account
export function TimeStampToDateString(timestamp: Timestamp): string {
    var now = new Date(timestamp.seconds * 1000 + timezoneDiffMilli);

    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);

    var today = now.getFullYear() + "-" + (month) + "-" + (day);

    return today;
}






//User Doc Classes and Methods
export class UserData {
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
    oldPasswords: string[];
    verified: boolean;
    securityQuestions: string[];
    passwordExpiration: Timestamp;

    constructor(userData: any) {
        this.active = userData.active;
        this.address = userData.address;
        this.dob = userData.dob;
        this.doc = userData.doc;
        this.first = userData.first;
        this.last = userData.last;
        this.role = userData.role;
        this.suspendEndDate = userData.suspendEndDate;
        this.suspendStartDate = userData.suspendStartDate;
        this.email = userData.email;
        this.password = userData.password;
        this.oldPasswords = userData.oldPasswords;
        this.verified = userData.verified;
        this.securityQuestions = userData.securityQuestions;
        if (this.securityQuestions == undefined) { this.securityQuestions = ["a", "b", "c"]; }
        this.passwordExpiration = userData.passwordExpiration;
        if (this.passwordExpiration == undefined) this.passwordExpiration = new Timestamp(0,0);
    }
}
export class UserDoc {
    username: string;
    userData: UserData;

    constructor(username: string, userData: any) {
        this.username = username;
        if (userData == null)
            this.userData = new UserData({});
        else
            this.userData = new UserData(userData);
    }
}
export async function GetAuthUserDoc(): Promise<any> {
    //Returns a doc snapshot for the user logged in via Auth
    //  searches the users collection for user with matching email
    //
    //  May return various strings for errors:
    //  "null" if auth doesn't have a current user
    //  "notFound"" if a user isn't found with the currentUser's email
    //  multipleUsers if multiple users found with the currentUser's email

    if (auth.currentUser == null) return "null";
    const queryResults = await getDocs(query(collection(db, "users"), where("email", "==", auth.currentUser.email))); //Get Users with the authorized user's email
    if (queryResults.size == 0) return "notFound";
    if (queryResults.size > 1) return "multipleUsers";
    return queryResults.docs[0];
}
//Converts a Query Snapshot to an array of userDocs
export function toUserDocArray(queryResults: QuerySnapshot): UserDoc[] {
    let userDocs: Array<UserDoc> = new Array();
    queryResults.forEach((docSnapshot) => {
        userDocs.push(new UserDoc(docSnapshot.id, docSnapshot.data()));
    })
    return userDocs;
}





//General Doc Retrieval/Set/Delete Methods
//Returns the data at "path" as a doc snapshot use: docSnapshot.id and docSnapshot.data()
export async function getDocAt(docPath: string): Promise<DocumentSnapshot> {
    const docSnapshot = await Promise.resolve(getDoc(doc(db, docPath)));
    return docSnapshot;
}
//Appends Object to doc at "path"
export async function saveDocAt(path: string, dataObject: any) {
    const retrievedDoc = await doc(db, path);
    const genericDataObj: object = { ...dataObject }; //Data must be in generic map to save to firebase
    setDoc(retrievedDoc, genericDataObj, { merge: true });
    captureEvent(path, dataObject);
}
export async function addDocRandomID(collectionPath: string, dataObject: any) {
    //For adding Docs with Random ID eg: accounts
    await addDoc(collection(db, collectionPath), dataObject);
}
//Deletes doc at "path"
export async function deleteDocAt(path: string) {
    await deleteDoc(doc(db, path));
}

onAuthStateChanged(auth,user => {
  if(user != null) {
    console.log('logged in!');
  } else {
    console.log('No user');
  }
});

async function captureEvent(path: string, dataObject: any){
    const eventCollection = await collection(db, 'event-log');
    const userID = path.split('/')[1];
    const document = JSON.stringify(dataObject);
    const eventDateTime = Timestamp.now();
    const genericDataObj: object = {userID, eventDateTime, document};
    addDoc(eventCollection, genericDataObj);
}
