import React, { useState } from "react";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"
import { UserData, UserDoc, db, getDocAt, saveDocAt} from "../firebase";
import { CollectionReference, Timestamp, addDoc, collection } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import {useNavigate} from "react-router-dom"
import bcrypt from "bcryptjs-react";
import PasswordChecklist from "react-password-checklist"
import Alert from "./Alert";
import "./NewUser.css";

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
  });

  const[formSubmitted, setFormSubmitted] = useState(false);
  const[currentPass, setCurrentPass] = useState("");
  const[isValid, setIsValid] = useState(false);



    //Handle initial field values
    if (props.createType == "edit" && lastUserDoc != props.defaultUserDoc) {
        console.log(props.defaultUserDoc.userData.dob.toDate().toLocaleString());
        setLastUserDoc(props.defaultUserDoc);
        setFormData({ firstName: props.defaultUserDoc.userData.first, lastName: props.defaultUserDoc.userData.last, emailAddress: props.defaultUserDoc.userData.email, dateOfBirth: props.defaultUserDoc.userData.dob.toDate().toLocaleString(), address:props.defaultUserDoc.userData.address, password: props.defaultUserDoc.userData.password })
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
    if(isValid) {
    console.log('Form Data:', formData);
    handleFireBaseDocument();
    addFirebaseUser(); 
    setFormSubmitted(true);
    } else {
      console.log("invalid password");
    }
  };

  const toTimeStamp = (date: string) => {
    const dt = new Date(date).getTime();
    return dt / 1000;
  }

  const handleFireBaseDocument = () => {
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
          hashPass(formData.password);
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
              "email": [formData.emailAddress],
              "verified": false,
              "password": [currentPass],
              "passwordExpiration": new Timestamp(0, 0),
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


  function hashPass (password: string) {
    var thishash = "";
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
            setCurrentPass(hash);
            });   
        });
  }

return (
    <div>
      <h5 className = "heading"> New User Information  </h5>
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
        <br></br>
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
              <button type="submit">{props.createType=="edit" ? "Confirm Edit": "Create Account"}</button>
            </div>
          </div>
        </div>
      </form>
        {props.createType == "create" &&
            <>
              <i>Already have an account? </i>
              <button onClick={() => {navigate('../');}}>Log in</button>
            </>
        }   
        {formSubmitted && props.createType == "create" && <CustomPopup child={
           <>
              <h2>Account Confirmation Needed</h2><br/>
              <h4>Please follow link to send account confirmation request to system administrator:</h4><br />
              <button onClick={() => {setFormSubmitted(false)}}>Close</button>
          </>
            }/>
        }
    </div>
  );
}

export default NewUser;