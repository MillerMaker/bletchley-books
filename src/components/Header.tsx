import "./Header.css"
import logoImage from "../assets/whiteHouse.png"

interface Props {
    homePath: string
    title: string
}

function Header(props: Props) {


    return <div className="header">
        <img
            src={logoImage}
            alt="Home"
            className="logo"
            onClick={() => location.href = props.homePath}
        />
        <h1 className="header-page-name">{props.title}</h1>
    </div>
}

export default Header;