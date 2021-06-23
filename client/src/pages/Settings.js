import React, { Component } from "react";
import axios from 'axios';
import GlobalVal from "./GlobalVal";
import { getToken } from "../Authenticator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "../Navbar";

/**
 * Page to change the username, email and upload an profile picture
 */
export default class Settings extends Component {
  /**
  * Constructor that stores the data.
  * @param {*} props 
  */
  constructor(props) {
    super(props);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeMail = this.onChangeMail.bind(this);
    this.onSubmitUsername = this.onSubmitUsername.bind(this);
    this.onSubmitMail = this.onSubmitMail.bind(this);
    this.goBack = this.goBack.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);

    this.state = {
      username: "",
      mail: "",
      previousUsername: "",
      data: "",
      selectedFile: null,
      message: ""
    };
  }

  /**
   * Adjusts the value in the state for username in terms of the user input .
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
  * Redirects the user to the "home" page.
  */
  goBack() {
    this.props.history.push("/home");
  }

  /**
   * Adjusts the value in the state for the selected file in terms of the file input.
   * @param {*} e trigger event.
   */
  onFileChange(e) {
    e.preventDefault();
    this.setState({ selectedFile: e.target.files });
  }

  /**
   * Sends the user input from username to the sever to check in the databse wether it's used or not. 
   * If not the username will be updated otherwise it's taken.
   * @param {*} e trigger event.
   */
  onSubmitUsername(e) {
    e.preventDefault();

    const user = {
      username: this.state.username,
      previousUsername: GlobalVal.username
    };


    axios.post("http://localhost:80/settings", { user }).then(res => {
      if (res.data) {
        GlobalVal.username = user.username;
        this.setState({ message: "Updated Username" });
      } else {
        this.setState({ message: "Username already taken" });
      }
    }).catch(error => {
      console.error(error.stack);
      this.setState({ message: "Error while updating username" });
    })
  }

  /**
   * Sends the user input from mail to the sever to check in the databse wether it's used or not. 
   * If not the email will be updated otherwise it's taken.
   * @param {*} e trigger event.
   */
  onSubmitMail(e) {
    e.preventDefault();

    const user = {
      mail: this.state.mail,
    };

    axios.post("http://localhost:80/settings", { user }).then(res => {
      if (res.data) {
        GlobalVal.email = user.mail;
        this.setState({ message: "Updated E-Mail" });
      } else {
        this.setState({ message: "Email is taken" });
      }
    }).catch(error => {
      console.error(error.stack);
      this.setState({ message: "Error while updating email" });
    });
  }

  /**
   * Sends a png that was selected from the user to store it at the server.
   * @param {*} e trigger event.
   */
  onFileUpload(e) {
    e.preventDefault();

    try {
      const formData = new FormData();
      for (var x = 0; x < this.state.selectedFile.length; x++) {
        formData.append("files", this.state.selectedFile[x])
      }

      axios.post("http://localhost:80/uploadProfilePicture", formData).then(res => {
        if (res.data) {
          this.setState({ message: "Uploaded Picture" })
        }
      }).catch(error => {
        console.error(error.stack);
        this.setState({ message: "Error while uploading picture Picture" })
      });
      document.getElementById("upload").value = "";
      this.setState({ selectedFile: null })
    } catch (error) {
      console.log(error);
      document.getElementById("upload").value = "";
      this.setState({ selectedFile: null })
      this.setState({ message: "Seleact a Picture" })
    }
  }

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present an "Access Denied" page is displayed , otherwise the regular "settings" page.
  */
  render() {
    if (getToken === "") {
      return (
        <>
          <div className="login-form">
            no Permission
          </div>
        </>
      );
    }
    return (
      <>
        <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
          <Navbar />
        </React.Suspense>
        <div id='main'>
          <div className="register-form">
            <h1>Settings</h1> <button className="logoutLblPos" onClick={this.goBack}>Back</button>
            <form action="/settings" method="POST" onSubmit={this.onSubmitUsername}>
              <input type="text" name="username" placeholder="Username (5 characters minimum)" minLength="5" onChange={this.onChangeUsername} required></input>
              <input type="submit" value="Update Username"></input>
            </form>
            <form onSubmit={this.onSubmitMail}>
              <input type="text" name="mail" placeholder="E-Mail" minLength="6" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangeMail} required ></input>
              <input type="submit" value="Update E-Mail"></input>
            </form>
            <form>
              <input id="upload" type="file" name="files " accept="image/png" onChange={this.onFileChange}></input>
              <input type="submit" value="Upload Picture" onClick={this.onFileUpload}></input>
            </form>
            <h1>{this.state.message}</h1>
          </div>
        </div>
      </>
    );
  }
}
