import "../styles/about.scss"
import { Link } from "wouter"

const About = () => {
    return (
        <div className="about">
            <div className="about__container about__container--card">
                <a href="https://github.com/IDJoshy" target="_blank" className="about__card about__card--github">
                    Creado por <b>EphemeralJosh</b>
                </a>
            </div>

            <div className="about__container about__container--card">
                <div className="about__card about__card--copy">
                    2026
                </div>
            </div>
        </div>
    )
}

export default About