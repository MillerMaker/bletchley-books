import "./Header.css"
import logoImage from "../assets/whiteHouse.png"
import { useNavigate } from "react-router"

interface Props {
    homePath: string
    title: string
}

function Header(props: Props) {

    const navigate = useNavigate();

    return <div className="header">
        <img
            src={logoImage}
            alt="Home"
            className="logo"
            onClick={() => navigate(props.homePath)}
        />
        <h1 className="header-page-name">{props.title}</h1>
    </div>
}

export default Header;