import React, { Component } from "react";
import { Link } from 'react-router-dom';
import GlobalVal from "./GlobalVal";

export default class Home extends Component {
  // This is the constructor that stores the data.

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this)
    
  }

  goBack(e){
    e.preventDefault();
    this.props.history.goBack();

  }

  // This following section will display the form that takes the input from the user.
  render() {
    if(GlobalVal.username == null){
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