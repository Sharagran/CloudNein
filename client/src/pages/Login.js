import React, { Component } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getToken, setToken } from "../Authenticator";
import GlobalVal from "./GlobalVal";

export default class Login extends Component {
  // This is the constructor that stores the data.
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

  // These methods will update the state properties.
  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  // This function will handle the submission.
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
      this.setState({ message: "Error while login" });
    });
  }

  // This following section will display the form that takes the input from the user.
  render() {
    if (getToken() === "") {
      return (
        <>
          <div className="login-form">
            <h1>Login</h1>
            <form action="/login" method="POST" onSubmit={this.onSubmit}>
              <input type="text" name="username" placeholder="Username" minLength="5" onChange={this.onChangeUsername} required></input>
              <input type="password" name="password" placeholder="Password" minLength="6" onChange={this.onChangePassword} required></input>
              <button id="register-btn" type="submit" value="login">Login</button>
            </form>
          </div>
          <div className="login-form">
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
