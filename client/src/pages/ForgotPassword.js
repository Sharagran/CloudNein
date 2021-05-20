import React, { Component } from "react";
import axios from 'axios';

export default class ForgotPassword extends Component {
  // This is the constructor that stores the data.
  constructor(props) {
    super(props);

	this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: ""
    };
  }

  // These methods will update the state properties.
  onChangeEmail(e) {
    this.setState({
      email: e.target.value,
    });
  }



// This function will handle the submission.
  onSubmit(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const email = {
      email: this.state.email,
    };

    axios
      .post("http://localhost:80/forgotPassword", {email})
      .then((res) => console.log(res.data));

    // We will empty the state after posting the data to the database
    this.setState({
      email: "",
    });
  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
		<>
		<div class="login-form">
			<h1>Forgot Password</h1>
			<form action="/forgotPassword" method="POST">
                <input type="text" name="email" placeholder="Email" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"  onChange={this.onChangeEmail} required></input>
				<input type="submit" value="Submit" onClick={this.onSubmit}></input>
			</form>
		</div>
    </>
    );
  }
}