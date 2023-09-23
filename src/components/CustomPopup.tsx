import { ReactNode } from 'react';
import './Popup.css'

function CustomPopup({ child }: { child: ReactNode }) {
    return(
    <div className="popup">
        <div className="popup-inner">
            {child}
        </div>
    </div>);
}

export default CustomPopup;