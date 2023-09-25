import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    color: String;
}

const Alert = ({children, color} : Props) => {
    return (
        <div className = {'alert alert-' + color + ' alert-dismissible'} >{children}</div>
    )
}
export default Alert;