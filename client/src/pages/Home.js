import React, { Component } from "react";
import { Link } from 'react-router-dom';
import GlobalVal from "./GlobalVal";
import { getToken } from "../Authenticator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const Navbar = React.lazy(() => import('../components/Navbar'));

/**
 * Home page to navigate the user to the "storage", "upload" or "settings".
 */
export default class Home extends Component {
  /**
  * Constructor that stores the data.
  * @param {*} props 
  */
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
  }

  /**
   * Returns the admin to the login page. The cookie is deleted and all user information.
   * and all user information will be reseted.
   * User will be redirectet to the "login" page
   */
  goBack() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    GlobalVal.username = null;
    GlobalVal.password = null;
    GlobalVal.loginState = null;
    GlobalVal.id = null;
    this.props.history.push('/');
  }

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present an "Access Denied" page is displayed , otherwise the regular "home" page.
  */
  render() {
    if (getToken() === "") {
      return (
        <>
          <div className="container-center">
            no Permission
          </div>
        </>
      );
    }
    return (
      <>
        <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
          <Navbar />
        </React.Suspense>
        <div id="main">
          <div className="container-center">
            <h1>Home</h1>  <button className="logoutLblPos" onClick={this.goBack}>Logout</button>
            <Link to="/Storage"><button id="forgotPassword-btn" type="submit" >Storage</button></Link>
            <Link to="/Upload"><button id="forgotPassword-btn" type="submit" >Upload</button></Link>
            <Link to="/Settings"><button id="forgotPassword-btn" type="submit" >Settings</button></Link>
          </div>
        </div>
      </>
    );
  }
}
