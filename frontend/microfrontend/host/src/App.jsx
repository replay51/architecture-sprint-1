import React from "react";
import ReactDOM from "react-dom/client";
import MasterPage from "./components/MasterPage";
import "./index.css";
import {BrowserRouter} from "react-router-dom";

const App = () => (
    <React.StrictMode>
        <BrowserRouter>
            <MasterPage/>
        </BrowserRouter>
    </React.StrictMode>
);
const rootElement = document.getElementById("app")
if (!rootElement) throw new Error("Failed to find the root element")

const root = ReactDOM.createRoot(rootElement)

root.render(<App/>)