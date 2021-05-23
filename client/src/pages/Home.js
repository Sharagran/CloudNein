import React, { Component } from "react";
import { Link } from 'react-router-dom';

export default class Home extends Component {
  // This is the constructor that stores the data.

  // This following section will display the form that takes the input from the user.
  render() {
    return (
		<>
            <div class="login-form">
              <h1>Home</h1>
              <Link to="/Home"><button id="register-btn" type="submit" >Storage</button></Link> 
              <Link to="/Settings"><button id="forgotPassword-btn" type="submit" >Settings</button></Link>
            </div>
    </>
    );
  }
}