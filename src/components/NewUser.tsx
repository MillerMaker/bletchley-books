import React, { useState } from "react";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"
import { ContainsEmail, HashString, UserData, UserDoc, db, getDocAt, saveDocAt} from "../firebase";
import { CollectionReference, Timestamp, addDoc, collection } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import { useNavigate} from "react-router-dom"
import bcrypt from "bcryptjs-react";
import PasswordChecklist from "react-password-checklist"
import Alert from "./Alert";
import "./NewUser.css";
import SendEmail from "../Email";

interface Props {
    createType: string; //Potential create types: create, adminCreate, edit
    defaultUserDoc: UserDoc;   //Pass in null if you don't want default values
}


function NewUser(props: Props) {
    const navigate = useNavigate();
    const [lastUserDoc, setLastUserDoc] = useState(new UserDoc("", null));
    const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    dateOfBirth: '',
    address: '',
    password: '',
    secQuestion1: '',
    secQuestion2: '',
    secQuestion3: '',
    });

    const[formSubmitted, setFormSubmitted] = useState(false);
    const[currentPass, setCurrentPass] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");



    //Handle initial field values
    if (props.createType == "edit" && lastUserDoc != props.defaultUserDoc) {
        console.log(props.defaultUserDoc.userData.dob.toDate().toLocaleString());
        setLastUserDoc(props.defaultUserDoc);
        setFormData({ 
          firstName: props.defaultUserDoc.userData.first, 
          lastName: props.defaultUserDoc.userData.last, 
          emailAddress: props.defaultUserDoc.userData.email, 
          dateOfBirth: props.defaultUserDoc.userData.dob.toDate().toLocaleString(), 
          address:props.defaultUserDoc.userData.address, 
          password: props.defaultUserDoc.userData.password,
          secQuestion1: props.defaultUserDoc.userData.securityQuestions[0],
          secQuestion2: props.defaultUserDoc.userData.securityQuestions[1],
          secQuestion3: props.defaultUserDoc.userData.securityQuestions[2],
        })
        console.log("Setting Edit Values");
    }

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if(name == "password") {
    setCurrentPass(value); }
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    //If an email is entered that firebase does not accept they were added to firestore but not auth
      if (!ContainsEmail(formData.emailAddress)) { setAlertShown(true); setAlertText("Invalid Email Address!"); return; }
      else setAlertShown(false);
    if(isValid) {
        console.log('Form Data:', formData);
    addFirebaseUser(); 
    handleFireBaseDocument();
    setFormSubmitted(true);
    } else {
      console.log("invalid password");
    }
    if(props.createType == "create"){
      SendEmail(
        "ianford622@gmail.com",
        "User Account Verification",
        "User " + formData.firstName + " " + formData.lastName + " (@"+ formData.emailAddress + ") is awaiting account verification. Please head to user verification page and accept or decline this user."
      )
    }
  };

  const toTimeStamp = (date: string) => {
    const dt = new Date(date).getTime();
    return dt / 1000;
  }

    const handleFireBaseDocument = async () => {
      if (props.createType == "edit") { //Edit User
          const userData = props.defaultUserDoc.userData;
          userData.first = formData.firstName;
          userData.last = formData.lastName;
          userData.email = formData.emailAddress;
          userData.dob = new Timestamp(toTimeStamp(formData.dateOfBirth), 0);
          userData.address = formData.address;
          saveDocAt("users/" + props.defaultUserDoc.username, userData);
      }
      else { //Save New User
          const secQuestions = [formData.secQuestion1, formData.secQuestion2, formData.secQuestion3];
          const hashedPass = await HashString(formData.password);
          var userData = {
              "active": false,
              "address": formData.address,
              "dob": new Timestamp(toTimeStamp(formData.dateOfBirth), 0),
              "doc": Timestamp.now(),
              "first": formData.firstName,
              "last": formData.lastName,
              "role": "user",
              "suspendEndDate": new Timestamp(0, 0),
              "suspendStartDate": new Timestamp(0, 0),
              "email": formData.emailAddress,
              "verified": props.createType == "adminCreate" ? true : false,
              "oldPasswords" : [],
              "password": hashedPass,
              "passwordExpiration": new Timestamp(0, 0),
              "securityQuestions": secQuestions,
          }
          saveDocAt("users/" + formData.firstName.substring(0, 1) + formData.lastName + (userData.dob.toDate().getMonth() <10 ? "0" : "")  + userData.dob.toDate().getMonth() + ("" + userData.dob.toDate().getFullYear()).substring(2), userData);
      }
  }

  const addFirebaseUser = () => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, formData.emailAddress, formData.password)
  .then((userCredential) => {
    console.log("Created New User");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
  }


return (
    <div>
      <h5 className="heading"> New User Information  </h5>
      {alertShown && <Alert text={alertText} color={"danger"}></Alert>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />

        </div>
        <div>
          <label htmlFor="address">Email Address:</label>
          <input
            type="text"
            id="emaillAddress"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            required
          />
        </div>

            <div>
                {props.createType != "edit" && //ONLY SHOW PASSWORD IF CREATING ACCOUNT 
                    <> 
                        <label htmlFor="Password">Password</label>
                        <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        /> 

                  <div className = "password-check">
                    {!isValid && <Alert text = "Please enter a valid password" color = 'danger'/>}
                            <PasswordChecklist
                            rules={["minLength","specialChar","number","capital"]}
                            minLength={8}
                            value={currentPass}
                            onChange={setIsValid}
                          />
                        <br></br>
                        <div>
                          <label htmlFor="secQuestion1">Name of your first pet: </label>
                          <input 
                            type="text"
                            id="secQuestion1"
                            name="secQuestion1"
                            value={formData.secQuestion1}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="secQuestion2">Name of your Elementary School: </label>
                          <input 
                            type="text"
                            id="secQuestion2"
                            name="secQuestion2"
                            value={formData.secQuestion2}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                        <label htmlFor="secQuestion3">Mother's maiden name: </label>
                        <input 
                        type="text"
                        id="secQuestion3"
                        name="secQuestion3"
                        value={formData.secQuestion3}
                        onChange={handleChange}
                        required
                        />
                        </div>
                    </div>
                    </>}
            <div> 
              <button type="submit">{props.createType=="edit" ? "Confirm Edit": "Create Account"}</button>
            </div>
          </div>
      </form>
        {props.createType == "create" &&
            <>
                <i>Already have an account? </i>
                <button onClick={() => {navigate('../');}}>Log in</button>
            </>
        }   
        {formSubmitted && props.createType == "create" &&
            <CustomPopup child={
           <>
              <h2>Account Confirmation Needed</h2><br/>
                <h4>Please wait for administrator verification of your account before logging in.</h4><br />
                <button onClick={() => { window.location.replace("/") }}>Close</button>
          </>
            }/>
        }
    </div>
  );
}

export default NewUser;