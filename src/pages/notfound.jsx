import { TbError404 } from "react-icons/tb";
import "../styles/notfound.scss"

const NotFound = () => {
    return (
        <div className="notfound">

            <h1 className="notfound__title">Ups! Recurso no encontrado</h1>
        
            <TbError404 className="notfound__icon" />
        </div>
    )
}

export default NotFound