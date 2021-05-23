import React, { Component } from "react";
import axios from 'axios';

export default class Settings extends Component {

  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
	this.onChangeMail = this.onChangeMail.bind(this);
    this.onSubmitUsername = this.onSubmitUsername.bind(this);
    this.onSubmitMail = this.onSubmitMail.bind(this);

    this.state = {
      username: "",
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


// This function will handle the submission.
  onSubmitUsername(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      username: this.state.username,
    };

    axios
      .post("http://localhost:80/settings", {user})
      .then((res) => console.log(res.data));

    // We will empty the state after posting the data to the database
    this.setState({
      username: "",
	  mail: ""
    });
  }

  onSubmitMail(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      mail: this.state.mail,
    };

    axios
      .post("http://localhost:80/settings", {user})
      .then((res) => console.log(res.data));

    // We will empty the state after posting the data to the database
    this.setState({
      username: "",
	  mail: ""
    });
  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
			<>
			<div class="register-form">
				<h1>Settings</h1>
				<form action="/" method="POST">
					<input type="text" name="username" placeholder="Username (6 characters minimum)" minLength="6" onChange={this.onChangeUsername} required></input>
                    <input type="submit" value="Update Username" onClick={this.onSubmitUsername}></input>
					<input type="text" name="mail" placeholder="E-Mail" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangeMail} required ></input>
					<input type="submit" value="Update E-Mail" onClick={this.onSubmitMail}></input>
				</form>
			</div>
			</>
    );
  }
}