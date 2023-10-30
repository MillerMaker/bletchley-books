import { useState } from "react";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"
import { ContainsEmail, HashString, UserDoc, db, saveDocAt} from "../firebase";
import { Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import { useNavigate} from "react-router-dom"
import PasswordChecklist from "react-password-checklist"
import Alert from "./Alert";
import "./NewUser.css";
import SendEmail from "../Email";
import { TimeStampToDateString } from "../firebase";

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
    const [passIsValid, setPassIsValid] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");
    const [userID, setUserID] = useState("");


    //Handle initial field values
    if (props.createType == "edit" && lastUserDoc != props.defaultUserDoc) {
        setLastUserDoc(props.defaultUserDoc);
        setFormData({ 
          firstName: props.defaultUserDoc.userData.first, 
          lastName: props.defaultUserDoc.userData.last, 
          emailAddress: props.defaultUserDoc.userData.email, 
          dateOfBirth: TimeStampToDateString(props.defaultUserDoc.userData.dob), 
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

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        setAlertShown(false);
        if (formSubmitted) return;

        //Fail if not in Email format
        if (!ContainsEmail(formData.emailAddress)) { setAlertShown(true); setAlertText("Invalid Email Address!"); return; }
        //Fail if Email is already in system
        const queryResults = await getDocs(query(collection(db, "users"), where("email", "==", formData.emailAddress)));
        if (props.createType !="edit" && queryResults.docs.length != 0) { setAlertShown(true); setAlertText("Email is already in use!"); return; }

        if (passIsValid || props.createType == "edit") { //Success
            console.log('Form Data:', formData);
            addFirebaseUser(); 
            handleFireBaseDocument();
            setFormSubmitted(true);
            setAlertShown(true);
            setAlertText("Account " + (props.createType == "edit" ? "Edited" : "Created")  + "!");
            setAlertColor("success");

        } else { //Invalid Pass
          console.log("invalid password");
        }
        if(props.createType == "create"){ //If creating an account and not Admin email them
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
          userData.email = formData.emailAddress.toLowerCase();
          userData.dob = new Timestamp(toTimeStamp(formData.dateOfBirth), 0);
          userData.address = formData.address;
          saveDocAt("users/" + props.defaultUserDoc.username, userData);
      }
      else { //Save New User
          const secQuestions = [formData.secQuestion1, formData.secQuestion2, formData.secQuestion3];
          const hashedPass = await HashString(formData.password);
          var userData = {
              "active": true,
              "address": formData.address,
              "dob": new Timestamp(toTimeStamp(formData.dateOfBirth), 0),
              "doc": Timestamp.now(),
              "first": formData.firstName,
              "last": formData.lastName,
              "role": "accountant",
              "suspendEndDate": new Timestamp(0, 0),
              "suspendStartDate": new Timestamp(0, 0),
              "email": formData.emailAddress.toLowerCase(),
              "verified": props.createType == "adminCreate" ? true : false,
              "oldPasswords" : [],
              "password": hashedPass,
              "passwordExpiration": new Timestamp(Date.now()/1000 + 60 * 60 * 24 * 365, 0), //Expire in one year
              "securityQuestions": secQuestions,
          }
          console.log(formData.dateOfBirth);

          //Generate USER ID based on fName lName and DOB
          const newUserID = formData.firstName.substring(0, 1) + formData.lastName +
              ((Number)(formData.dateOfBirth.substring(5, 2)) < 10 ? "0" : "") +
              formData.dateOfBirth.substring(5, 7) +
              ("" + formData.dateOfBirth.substring(2, 4));
          setUserID(newUserID); //Cache User ID in state to display it

          saveDocAt("users/" + newUserID, userData);
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

                    <div className="password-check">
                        {!passIsValid && <Alert text="Please enter a valid password" color='danger' />}
                            <PasswordChecklist
                            rules={["minLength","specialChar","number","capital"]}
                            minLength={8}
                            value={currentPass}
                            onChange={setPassIsValid}
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
                    <button title="Confirm your new account details" className="btn btn-primary" type="submit">{props.createType == "edit" ? "Confirm Edit" : "Create Account"}</button>
            </div>
          </div>
      </form>
        {props.createType == "create" &&
            <>
            <i>Already have an account? </i>
            <button title="Go to login page" className="btn btn-secondary" onClick={() => { navigate('../'); }}>Log in</button>
            </>
        }   
        {formSubmitted && props.createType == "create" &&
            <CustomPopup child={
           <>
                <h2>Account Confirmation Needed</h2><br />
                <h5>Your username is: {userID}</h5>
                <h5>Please wait for administrator verification before logging in.</h5><br />
                <button title="Go back" onClick={() => { window.location.replace("/") }}>Close</button>
          </>
            }/>
        }
    </div>
  );
}

export default NewUser;