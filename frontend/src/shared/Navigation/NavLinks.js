import { NavLink } from "react-router-dom";
import "./NavLinks.css";
import { AuthContext } from "../../shared/context/auth-context";
import { useContext } from "react";

function NavLinks(props) {
  const authCtx = useContext(AuthContext);
  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          All Users
        </NavLink>
      </li>
      {authCtx.isLoggedIn && (
        <li>
          <NavLink to={`/${authCtx.userId}/places`} exact>
            My Places
          </NavLink>
        </li>
      )}

      {authCtx.isLoggedIn && (
        <li>
          <NavLink to="/place/new" exact>
            Add Place
          </NavLink>
        </li>
      )}

      {!authCtx.isLoggedIn && (
        <li>
          <NavLink to="/auth" exact>
            Authenticate
          </NavLink>
        </li>
      )}
      {authCtx.isLoggedIn && <button onClick={authCtx.logout}>Logout</button>}
    </ul>
  );
}

export default NavLinks;
