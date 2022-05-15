import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import NewPlace from "./places/pages/NewPlace";
import Users from "./user/pages/Users";
import MainNavigation from "./shared/Navigation/MainNavigation";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./user/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";
import React, { useContext } from "react";

function App() {
  const authCtx = useContext(AuthContext);

  console.log("login " + authCtx.isLoggedIn);

  return (
    <BrowserRouter>
      <MainNavigation />
      <main>
        <Switch>
          <Route path="/" exact>
            <Users />
          </Route>
          <Route path="/:userId/places" exact>
            <UserPlaces />
          </Route>
          {authCtx.isLoggedIn && (
            <Route path="/place/new" exact>
              <NewPlace />
            </Route>
          )}
          {authCtx.isLoggedIn && (
            <Route path="/place/:placeId" exact>
              <UpdatePlace />
            </Route>
          )}
          {!authCtx.isLoggedIn && (
            <Route path="/auth" exact>
              <Auth />
            </Route>
          )}
          {authCtx.isLoggedIn ? <Redirect to="/" /> : <Redirect to="/auth" />}
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
