import React, { Component } from "react";
import axios from 'axios';

export default class Registration extends Component {
  // This is the constructor that stores the data.

  /** 
    check() {
	if (document.getElementById('password').value === document.getElementById('confirm_password').value) {
	  document.getElementById('confirm_password').style.color = 'green';
	  //document.getElementById('message').innerHTML = 'matching';
	} else {
	  document.getElementById('confirm_password').style.color = 'red';
	  //document.getElementById('message').innerHTML = 'not matching';
	}
  }
   * */ 

  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
	this.onChangeMail = this.onChangeMail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: "",
      password: "",
	  mail: ""
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
  onChangePassword(e) {
    this.setState({
    	password: e.target.value,
    });
  }



// This function will handle the submission.
  onSubmit(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      username: this.state.username,
      password: this.state.password,
	  mail: this.state.mail
    };

    axios
      .post("http://localhost:80/register", {user})
      .then((res) => {
        if (res.data === true){
          this.props.history.push('/home')
        }else{
          this.props.history.push('/failed')
        }
      });

    // We will empty the state after posting the data to the database

  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
			<>
			<div class="register-form">
				<h1>Registration</h1>
				<form action="/Registration" method="POST">
					<input type="text" name="username" placeholder="Username (6 characters minimum)" minLength="6" onChange={this.onChangeUsername} required></input>
					<input type="text" name="mail" placeholder="E-Mail" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangeMail} required ></input>
					<input id="password"type="password" name="password" placeholder="Password (6 characters minimum)" minLength="6" onChange={this.onChangePassword} required ></input>
					<input id="confirm_password" type="password" name="confirm_password" placeholder="Confirm password" minLength="6" required></input>
					<input type="submit" value="Create Account" onClick={this.onSubmit}></input>
				</form>
			</div>
			</>
    );
  }
}