import React, { Component } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { setToken } from "../Authenticator";
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
    };
  }

  // These methods will update the state properties.
  onChangeUsername(e) {
    this.setState({
      username: e.target.value,
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
    };

    axios
      .post("http://localhost:80/login", {user})
      .then((res) => {

        if(res.data.user.Username === "Admin"){
          setToken(res.data.token);
          GlobalVal.loginState = true;
          this.props.history.push('/Admin')
        }else if (res.data.user.Username !== undefined){
          setToken(res.data.token);
          GlobalVal.username = res.data.user.Username;
          GlobalVal.email = res.data.user.Email;
          GlobalVal.loginState = true;
          this.props.history.push('/home')
        }else{
          this.props.history.push('/failed')
        }
        
      });
  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (

        <>
            <div class="login-form">
                <h1>Login</h1>
                <form action="/login" method="POST" >
                    <input type="text" name="username" placeholder="Username" onChange={this.onChangeUsername} required></input>
                    <input type="password" name="password" placeholder="Password"  onChange={this.onChangePassword}  required></input>
                    <button id="register-btn" type="submit" value="login" onClick={this.onSubmit}>Login</button>
                </form>
            </div>
            <div class="login-form">
              <Link to="/Registration"><button id="register-btn" type="submit" >Create Account</button></Link> 
              <Link to="/ForgotPassword"><button id="forgotPassword-btn" type="submit" >Forgot Password?</button></Link>
            </div>
        </>
    );
  }
}
