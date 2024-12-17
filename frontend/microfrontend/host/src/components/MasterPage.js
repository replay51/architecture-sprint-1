import React, {lazy, Suspense} from "react";
import {Route, useHistory, Switch} from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth.js";

const Login = lazy(() => import('auth/Login').catch(() => {
        return {default: () => <div className='error'>Component is not available!</div>};
    })
);
const Register = lazy(() => import('auth/Register').catch(() => {
        return {default: () => <div className='error'>Component is not available!</div>};
    })
);
const Main = lazy(() => import('feed/Main').catch(() => {
        return {default: () => <div className='error'>Component is not available!</div>};
    })
);

function MasterPage() {
    const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
    const [tooltipStatus, setTooltipStatus] = React.useState("");
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [email, setEmail] = React.useState("email");
    const history = useHistory();

    React.useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            auth
                .checkToken(token)
                .then((res) => {
                    setEmail(res.data.email);
                    setIsLoggedIn(true);
                    history.push("/");
                })
                .catch((err) => {
                    localStorage.removeItem("jwt");
                    console.log(err);
                });
        }
    }, [history]);

    function onRegister({email, password}) {
        auth
            .register(email, password)
            .then((res) => {
                setTooltipStatus("success");
                setIsInfoToolTipOpen(true);
                history.push("/signin");
            })
            .catch((err) => {
                console.log(err);
                setTooltipStatus("fail");
                setIsInfoToolTipOpen(true);
            });
    }

    function onLogin({email, password}) {
        auth
            .login(email, password)
            .then((res) => {
                setIsLoggedIn(true);
                setEmail(email);
                history.push("/");
            })
            .catch((err) => {
                console.log(err);
                setTooltipStatus("fail");
                setIsInfoToolTipOpen(true);
            });
    }

    function onSignOut() {
        // при вызове обработчика onSignOut происходит удаление jwt
        localStorage.removeItem("jwt");
        setIsLoggedIn(false);
        // После успешного вызова обработчика onSignOut происходит редирект на /signin
        history.push("/signin");
    }

    function closeAllPopups() {
        setIsInfoToolTipOpen(false);
    }

    return (
        <div className="page__content">
            <Header email={email} onSignOut={onSignOut}/>
            <Switch>
                <ProtectedRoute
                    exact
                    path="/"
                    component={Main}
                    loggedIn={isLoggedIn}
                />
                <Route path="/signup">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Register onRegister={onRegister}/>
                    </Suspense>
                </Route>
                <Route path="/signin">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Login onLogin={onLogin}/>
                    </Suspense>
                </Route>
            </Switch>
            <Footer/>
            <InfoTooltip
                isOpen={isInfoToolTipOpen}
                onClose={closeAllPopups}
                status={tooltipStatus}
            />
        </div>
    );
}

export default MasterPage;
