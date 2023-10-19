import "./Header.css"
import logoImage from "../assets/BletchleyBooksLogo.jpg"
import userImage from "../assets/noun-user-6126605.png"
import {getAuth} from "firebase/auth"
import { NavigateFunction, useNavigate } from "react-router"
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { auth, UserData, getDocAt, GetAuthUserDoc} from "../firebase"
import {useState} from "react";





function HandleLogoff() {
    auth.signOut();
    window.location.replace("/");
}



interface Props {
    homePath: string
    title: string
}

function Header(props: Props) {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState("");
    getRole();
    return (
    <div className="header">
            <div className = "col-2">
                <img
                    src={logoImage}
                    alt="Home"
                    className="logo"
                    onClick={() => navigate(props.homePath)}
                />  
            </div>
            <div className = "col-sm">
                  <ShowNavBar></ShowNavBar>
            </div>
            <div className = "col-3" >
                <ShowUsername />
                <div className = "utilities">
                    <div className = "help inactive"  onClick={() => {navigate("/private-outlet/help", { state : props.homePath})}}> 
                        Help
                    </div>
                    <div className="logoff inactive" onClick={HandleLogoff}>
                        Logoff
                    </div>
                </div>
            </div> 
        </div>
    )
    async function getRole() {
        const authUserDoc = await GetAuthUserDoc();
        if (authUserDoc == "null" || authUserDoc == "multipleUsers" || authUserDoc == "notFound") return "noUser";
        setUserRole(authUserDoc.data().role);
    }

    
function ShowNavBar () {
  if(userRole != '') {

    return(
      <>
      <div className = {props.homePath == '/private-outlet/chart-of-accounts'? 'chart-of-accounts active' : 'chart-of-accounts inactive'} onClick = {() => navigate("/private-outlet/chart-of-accounts")}> 
            Accounts
      </div>
      <div className = "journal inactive" > 
            Journal
      </div>
      {userRole == 'admin' &&
      <div className = {props.homePath == '/private-outlet/event-log'? 'event-log active' : 'event-log inactive'} onClick = {() => navigate("/private-outlet/event-log")}> 
            Event Log
      </div>
      }
      {userRole == 'admin' &&
      <div className = {props.homePath == '/private-outlet/admin'? 'admin-home active' : 'admin-home inactive'} onClick = {() => navigate("/private-outlet/admin")}> 
            Admin Home
      </div>
      }
 </>
    )
  }
}

}

function ShowUsername() {
    const navigate = useNavigate();
    if (auth.currentUser) {
    return (
        <>
            <img src = {userImage}
                className="userImage"
                onClick={() => navigate("/private-outlet/password-change")}
            />
            <div className="username">{auth.currentUser.displayName} </div>
        </>
    )
    } else {
        return (
            <></>
        )
    }
}



export default Header;