interface Props {
    text : string;
    onClick : () => void;
}

const Button = ({text, onClick} : Props) => {

        return (
            <div>
            <button type="button" className= "btn btn-secondary" onClick={onClick}> {text} </button>
            </div>
        )
}

export default Button;