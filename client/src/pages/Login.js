import React, { Component } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getToken, setToken } from "../Authenticator";
import GlobalVal from "./GlobalVal";

/**
 * Login page to verify the user. Can direct the user to registration or forget password.
 */
export default class Login extends Component {
  /**
   * Constructor that stores the data.
   * @param  props 
   */
  constructor(props) {
    super(props);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: "",
      password: "",
      message: "",
    };
  }


  /**
   * Adjusts the value in the state for username in terms of the user input.
   * @param  e trigger event.
   */
  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  /**
  * Adjusts the value in the state for password in terms of the user input.
  * @param  e specific html input tag.
  */
  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  /**
   * Sends the username and password specified by user to the server. 
   * If the data matches the data in the database, the user will be logged in and sent to the Home or Admin page. Depending on the username.
   * @param  e trigger event.
   */
  onSubmit(e) {
    e.preventDefault();
    
    const user = {
      username: this.state.username,
      password: this.state.password,
    };

    axios.post("http://localhost:80/login", { user }).then((res) => {
      if (res.data.user.username === "Admin") {
        setToken(res.data.token);
        GlobalVal.username = res.data.user.username;
        GlobalVal.email = res.data.user.email;
        GlobalVal.loginState = true;
        GlobalVal.id = res.data.user.id;
        this.props.history.push('/Admin')
      } else if (res.data.user.username !== undefined) {
        setToken(res.data.token);
        GlobalVal.username = res.data.user.username;
        GlobalVal.email = res.data.user.email;
        GlobalVal.loginState = true;
        GlobalVal.id = res.data.user.id;
        this.props.history.push('/home');
      }
    }).catch(error => {
      console.error(error.stack);
      this.setState({ message: "Invalid login" });
    });
  }

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present the login page is displayed , otherwise the home page.
  */
  render() {
    if (getToken() === "") {
      return (
        <>
          <div className="container-center">
            <h1>Login</h1>
            <form action="/login" method="POST" onSubmit={this.onSubmit}>
              <input type="text" name="username" placeholder="Username" minLength="5" onChange={this.onChangeUsername} required></input>
              <input type="password" name="password" placeholder="Password" minLength="6" onChange={this.onChangePassword} required></input>
              <button id="register-btn" type="submit" value="login">Login</button>
            </form>
          </div>
          <div className="container-center">
            <Link to="/Registration"><button id="register-btn" type="submit" >Create Account</button></Link>
            <Link to="/ForgotPassword"><button id="forgotPassword-btn" type="submit" >Forgot Password?</button></Link>
            <h1>{this.state.message}</h1>
          </div>
        </>
      );
    }
    return (
      <>
        {this.props.history.push('/home')}
      </>
    );
  }
}
