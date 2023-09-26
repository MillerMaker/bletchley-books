
import { initializeApp } from "firebase/app";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, setDoc, getDocs, doc, getDoc, Timestamp, query, where, QuerySnapshot, DocumentData, DocumentSnapshot, deleteDoc } from "firebase/firestore";


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
    verified: boolean;
    securityQuestions: string[]
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
        this.verified = userData.verified;
        this.securityQuestions = userData.securityQuestions;
        if (this.securityQuestions == undefined) { this.securityQuestions = ["a", "b", "c"]; console.log("SET DEFAULT SEC QUESTION VALUES"); }
        this.passwordExpiration = userData.passwordExpiration;
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


