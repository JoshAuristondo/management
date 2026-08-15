
import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";

import "../../styles/navbar.scss";

import navbar_logo from "../../assets/navbar_logo.png" ;

import { RxHamburgerMenu } from "react-icons/rx";
import { MdClose } from "react-icons/md";   

const NavBar = () => 
{
    const [stateHamburguer, setHamburguer] = useState(false);
    const toggleHamburguer= () => setHamburguer((prev) => !prev);


    return (
        <div className="navbar">

            <div className="navbar__container navbar__container--upper">

                <div className="navbar__logo">
                    <img src={navbar_logo} alt="navbar logo"  className="navbar__img"/>
                </div>

                <nav className="navbar__nav navbar__nav--upper">
                    <ul className="navbar__links">
                        <NavBarLink href="/" name="Inicio"/>
                        <NavBarLink href="/dashboard" name="Dashboard"/>
                        <NavBarLink href="/about" name="Acerca de"/>
                    </ul>
                </nav>

                <div onClick={toggleHamburguer} className="navbar__button navbar__button--hamburguer">
                    {stateHamburguer ? <MdClose className="navbar__icon"/> : <RxHamburgerMenu className="navbar__icon"/>}
                </div>

                {/*
                <div className="navbar__session">

                </div> 
                */}


            </div>
            
            <div className={`navbar__container navbar__container--lower ${stateHamburguer ? "" : "navbar__container--hidden"}`}>
                <nav className="navbar__nav navbar__nav--lower">
                    <ul className="navbar__links navbar__links--lower">
                        <NavBarLink href="/" name="Inicio"/>
                        <NavBarLink href="/dashboard" name="Dashboard"/>
                        <NavBarLink href="/about" name="Acerca de"/>
                    </ul>
                </nav>
            </div>
            
        </div>
    );
}



const NavBarLink = (props) => 
{
    const [isActive] = useRoute(props.href);

    return (
        <li className={`navbar__link ${isActive ? "navbar__link--active" : ""}`}>
            <Link href={props.href} className = "navbar__link--href navbar__text"> 
                {props.name}
            </Link>
        </li>
    );
}

const NavBarHeader = () => 
{
    const [location] = useLocation();

    let PageHeader = "";

    switch (location) 
    {
        case "/":
            PageHeader = "Inicio";
            break;
        case "/dashboard":
            PageHeader = "Tablas de Trabajo";
            break;
        case "/about":
            PageHeader = "Acerca de";
            break;
        case "/details":
            PageHeader = "Detalles";
            break;
        case "/new":
            PageHeader = "Nueva Orden";
            break;
        default:
            PageHeader = "Not Implemented";
            break;
    }

    return (
        <strong className="navbar__text navbar__text--header">{PageHeader}</strong>
    );
}

export default NavBar