import "./Header.css"
import logoImage from "../assets/whiteHouse.png"
import userImage from "../assets/noun-user-6126605.png"
import {getAuth} from "firebase/auth"
import { useNavigate } from "react-router"

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
                    <ShowUsername/>
            </div> 
        </div>
    )
}

function ShowUsername() {
    const auth = getAuth();
    if (auth.currentUser) {
    return (
        <>
        <img src = {userImage}
        className = "userImage"
        />
        <h4 className="username">{auth.currentUser.displayName}</h4>
        </>
    )
    } else {
        return (
            <></>
        )
    }
}

export default Header;