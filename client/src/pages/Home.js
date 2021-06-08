import React, { Component } from "react";
import { Link } from 'react-router-dom';
import GlobalVal from "./GlobalVal";
import { getToken } from "../Authenticator";

export default class Home extends Component {
  // This is the constructor that stores the data.

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this)
  }

  goBack(e){
    e.preventDefault();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    GlobalVal.username = null;
    GlobalVal.password = null;
    GlobalVal.loginState = null;
    GlobalVal.id= null;
    this.props.history.push('/')
  }

  // This following section will display the form that takes the input from the user.
  render() {
    if(getToken() === ""){
      return (
        <>
                <div class="login-form">
                  no Permission
                </div>
        </>
        );
    }
    return (
		<>
            <div class="login-form">
              <h1>Home</h1>  <button class="logoutLblPos" onClick={this.goBack}>Logout</button>
              <Link to="/Storage"><button id="forgotPassword-btn" type="submit" >Storage</button></Link>
              <Link to="/Upload"><button id="forgotPassword-btn" type="submit" >Upload</button></Link>
              <Link to="/Settings"><button id="forgotPassword-btn" type="submit" >Settings</button></Link>
            </div>
    </>
    );
  }
}