import React, { Component } from "react";
import axios from 'axios';

export default class Registration extends Component {
  // This is the constructor that stores the data.

  constructor(props) {
    super(props);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeMail = this.onChangeMail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.goBack = this.goBack.bind(this);

    this.state = {
      username: "",
      password: "",
      mail: "",
      message: ""
    };
  }

  // These methods will update the state properties.
  onChangeUsername(e) {
    this.setState({ username: e.target.value });
  }

  onChangeMail(e) {
    this.setState({ mail: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  goBack(e) {
    e.preventDefault();
    this.props.history.push('/');
  }

  // This function will handle the submission.
  onSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.state.username,
      password: this.state.password,
      mail: this.state.mail
    };

    try {
      axios.post("http://localhost:80/register", { user }).then(res => {
        if (res.data === true) {
          this.props.history.push('/success');
        } else {
          this.props.history.push('/failed');
        }
      });
    } catch (error) {
      console.error(error.stack);
      this.setState({ message: "Error while registration" });
    }
  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
      <>
        <div className="register-form">
          <h1>Registration</h1> <button className="logoutLblPos" onClick={this.goBack}>Back</button>
          <form action="/Registration" method="POST" onSubmit={this.onSubmit}>
            <input type="text" name="username" placeholder="Username (5 characters minimum)" minLength="5" onChange={this.onChangeUsername} required></input>
            <input type="text" name="mail" placeholder="E-Mail" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangeMail} required ></input>
            <input id="password" type="password" name="password" placeholder="Password (6 characters minimum)" minLength="6" onChange={this.onChangePassword} required ></input>
            <input type="submit" value="Create Account"></input>
          </form>
          <h1>{this.state.message}</h1>
        </div>
      </>
    );
  }
}