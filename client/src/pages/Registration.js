import React, { Component } from "react";
import axios from 'axios';

/**
 * Page to create an account.
 */
export default class Registration extends Component {
  /**
  * Constructor that stores the data.
  * @param {*} props 
  */
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

  /**
   * Adjusts the value in the state for username in terms of the user input.
   * @param {*} e trigger event.
   */
  onChangeUsername(e) {
    this.setState({ username: e.target.value });
  }

  /**
  * Adjusts the value in the state for mail in terms of the user input.
  * @param {*} e trigger event.
  */
  onChangeMail(e) {
    this.setState({ mail: e.target.value });
  }

  /**
  * Adjusts the value in the state for password in terms of the user input.
  * @param {*} e trigger event.
  */
  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  /**
  * Redirects the user to the "login" page.
  */
  goBack() {
    this.props.history.push('/');
  }

  /**
  * Sends the user input from username, password and mail to the sever to check
  * if the username or email is already taken in the database. If not redirect to success page else to failed page
  * @param {*} e trigger event.
  */
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

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present an "Access Denied" page is displayed , otherwise the regular "registration" page.
  */
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