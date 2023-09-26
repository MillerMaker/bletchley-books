import React, { useState } from "react";
import { db } from "../firebase";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"
import { CollectionReference, Timestamp, addDoc, collection } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import {useNavigate} from "react-router-dom"
import bcrypt from "bcryptjs-react";

interface Props {
  atAdmin: boolean;
}


function NewUser(props: Props) {
  const navigate = useNavigate();
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

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    handleFireBaseDocument();
    addFirebaseUser(); 
    setFormSubmitted(true);
  };

  const toTimeStamp = (date: string) => {
    const dt = new Date(date).getTime();
    return dt / 1000;
  }

  const handleFireBaseDocument = () => {
    const usersCollection = collection(db, "users");
    hashPass(formData.password);
    var userData = {
      "active": false,
      "address": formData.address,
      "dob": new Timestamp(toTimeStamp(formData.dateOfBirth),0),
      "doc": Timestamp.now(),
      "first": formData.firstName,
      "last": formData.lastName,
      "role": "user",
      "suspendEndDate": new Timestamp(0,0),
      "suspendStartDate": new Timestamp(0,0),
      "email": [formData.emailAddress],
      "verified": false,
      "password": [currentPass]
    }
    addDoc(usersCollection, userData);
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
          <label htmlFor="Password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button type="submit">Create Account</button>
        </div>
      </form>
          {!props.atAdmin &&
            <>
              <i>Already have an account? </i>
              <button onClick={() => {navigate('../');}}>Log in</button>
            </>
          }   

          {!props.atAdmin && formSubmitted && <CustomPopup child={
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