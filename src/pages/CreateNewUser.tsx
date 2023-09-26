
import Header from "../components/Header";
import NewUser from "../components/NewUser"
import { useState } from "react";


function CreateNewUser() {
  

    return (
      <>
      <Header  homePath="" title = "Create User"/>
      <NewUser atAdmin = {false}/>
      </>
    )
}

export default CreateNewUser;