import { ReactNode } from "react";

interface Props {
    text: ReactNode;
    color: String;
}

const Alert = ({text, color} : Props) => {
    return (
        <div className={'alert alert-' + color + ' alert-dismissible'} >
            <strong>{text}</strong>
        </div>
    )
}
export default Alert;