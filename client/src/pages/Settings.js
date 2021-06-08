import React, { Component } from "react";
import axios from 'axios';
import GlobalVal from "./GlobalVal";
import { getToken } from "../Authenticator";


export default class Settings extends Component {


  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
	  this.onChangeMail = this.onChangeMail.bind(this);
    this.onSubmitUsername = this.onSubmitUsername.bind(this);
    this.onSubmitMail = this.onSubmitMail.bind(this);
    this.goBack = this.goBack.bind(this)

    this.state = {
      username: "",
	    mail: "", 
      previousUsername: GlobalVal.username,
      previousMail: GlobalVal.email
    };
  }

  // These methods will update the state properties.
  onChangeUsername(e) {
    this.setState({
    	username: e.target.value,
    });
  }

  onChangeMail(e) {
	this.setState({
		mail: e.target.value,
	});  
  }

  goBack(e){
    e.preventDefault();
    this.props.history.push("/home");
  }

// This function will handle the submission.
  onSubmitUsername(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      username: this.state.username,
      previousUsername: GlobalVal.username
    };

    axios
      .post("http://localhost:80/settings", {user})
      .then((res) => console.log(res.data));

  
    GlobalVal.username = user.username; 
    console.log(GlobalVal.username)
  }

  onSubmitMail(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      mail: this.state.mail,
      previousMail: GlobalVal.email
    };
    
    axios
      .post("http://localhost:80/settings", {user})
      .then((res) => console.log(res.data));


    GlobalVal.email = user.mail; 
  }

  // This following section will display the form that takes the input from the user.
  render() {
    if(getToken === ""){
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
			<div class="register-form">
				<h1>Settings</h1> <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
				<form action="/settings" method="POST">
					<input type="text" name="username" placeholder="Username (6 characters minimum)"  minlength="8" onChange={this.onChangeUsername} required></input>
          <input type="submit" value="Update Username" onClick={this.onSubmitUsername}></input>
					<input type="text" name="mail" placeholder="E-Mail" minLength="6" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangeMail} required ></input>
					<input type="submit" value="Update E-Mail" onClick={this.onSubmitMail}></input>
				</form>
			</div>
			</>
    );
  }
}