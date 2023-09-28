import "./Header.css"
import logoImage from "../assets/BletchleyBooksLogo.jpg"
import userImage from "../assets/noun-user-6126605.png"
import {getAuth} from "firebase/auth"
import { NavigateFunction, useNavigate } from "react-router"
import { auth } from "../firebase"




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

    return (
    <div className="header">
            <div className = "col-sm">
                <img
                    src={logoImage}
                    alt="Home"
                    className="logo"
                    onClick={() => navigate(props.homePath)}
                />  
            </div>
            <div className = "col-8"> 
                <div className = "header-page-name">
                    <h1>{props.title}</h1>
                </div>
            </div>
            <div className = "col-sm" >
                <ShowUsername />
            </div> 
        </div>
    )
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
            <h4 className="username">{auth.currentUser.displayName}</h4>
            <span>   </span>
            <button className="btn btn-secondary" onClick={HandleLogoff}>Logoff</button>
        </>
    )
    } else {
        return (
            <></>
        )
    }
}

export default Header;