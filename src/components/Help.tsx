import { useNavigate, useLocation } from "react-router"
import backButton from "../assets/back_arrow_icon.png";
import './Help.css'


interface Props {
    backPath: String;
}

function Help (props: Props) {
    const navigate = useNavigate(); 
    const location = useLocation(); 

    function handleBack() {
        location.hash = '';
        console.log(props.backPath)
       //navigate('' + props.backPath); 
    }
    return (
        <>
        <div className = "banner">
            <div className = "back"  onClick= {() => {navigate("../chart-of-accounts")}}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
            <div className ="account-name">
                Help
            </div>
        </div>
        <div className="info">
        <div id="list-example" className="list-group">
  <a className="list-group-item list-group-item-action" href="#list-item-1">Accounts Features</a>
  <a className="list-group-item list-group-item-action" href="#list-item-2">Journal Features</a>
  <a className="list-group-item list-group-item-action" href="#list-item-3">Event Log</a>
  <a className="list-group-item list-group-item-action" href="#list-item-4">Administrator Tools</a>
</div>
<div data-spy="scroll" data-target="#list-example" data-offset="0" className="scrollspy-example">
  <h4 id="list-item-1">Accounts Features</h4>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <h4 id="list-item-2">Journal Features</h4>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <h4 id="list-item-3">Event Log</h4>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <h4 id="list-item-4">Administrator Tools</h4>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</div>

</div>
        </>
    )

}

export default Help; 