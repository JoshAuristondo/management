import { Route, Switch } from "wouter";

import NavBar from './components/navbar/navbar.jsx'
import Home from "./pages/home.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Details from "./pages/details.jsx";
import New from "./pages/new.jsx";
import About from "./pages/about.jsx";

import NotFound from './pages/notfound.jsx'


import './styles/app.scss'

function App() 
{

    return (
        <main className="app">
            <NavBar />
            <Switch>
                <Route path="/" component={Home} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/details" component={Details} />
                <Route path="/new" component={New} />
                <Route path="/about" component={About} />
                <Route path="*" component={NotFound} />
            </Switch>
        </main>
    )
}

export default App
