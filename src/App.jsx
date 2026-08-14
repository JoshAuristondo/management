import { Route, Switch } from "wouter";
import { useState, useEffect } from 'react'
import NavBar from './components/navbar/navbar.jsx'

function App() 
{

    return (
        <>
            <NavBar />

            <main>
                <Switch>
                    <Route path="/" component={Home} />
                </Switch>
            </main>
        </>

    )
}

export default App
