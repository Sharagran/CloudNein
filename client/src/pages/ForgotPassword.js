import React, { Component } from "react";
import axios from 'axios';

/**
 * Page to send a new password to the user.
 */
export default class ForgotPassword extends Component {
  /**
   * Constructor that stores the data.
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.goBack = this.goBack.bind(this);

    this.state = {
      email: "",
      message: ""
    };
  }
  /**
  * Returns the user to the login page.
  */
  goBack() {
    this.props.history.push('/');
  }

  /**
  * Adjusts the value in the state for the email in terms of the user input .
  * @param {*} e trigger event.
  */
  onChangeEmail(e) {
    this.setState({
      email: e.target.value
    });
  }


  // This function will handle the submission.
  /**
   * The email specified by the user is sent to the server and it looks if there is an entry in the database. 
   * If yes, then the user is redirected to the "sendEmail" page, otherwise to the "failed" page.
   * @param {*} e trigger event.
   */
  onSubmit(e) {
    e.preventDefault();

    const email = {
      email: this.state.email
    }

    axios.post("http://localhost:80/forgotPassword", { email }).then((res) => {
      if (res.data === true) {
        this.props.history.push('/sendEmail');
      } else {
        this.props.history.push('/failed');
      }
    }).catch(error => {
      console.error(error.stack);
      this.setState({ message: "Error while sending email" });
    });
  }

  /**
  * Display the form that takes the input from the user.
  * @returns The regular forgot password page.
  */
  render() {
    return (
      <>
        <div className="container-center">
          <h1>Forgot Password</h1> <button className="logoutLblPos" onClick={this.goBack}>Back</button>
          <form action="/forgotPassword" method="POST" onSubmit={this.onSubmit}>
            <input type="text" name="email" placeholder="Email" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangeEmail} required></input>
            <input type="submit" value="Submit"></input>
          </form>
          <h1>{this.state.message}</h1>
        </div>
      </>
    );
  }
}