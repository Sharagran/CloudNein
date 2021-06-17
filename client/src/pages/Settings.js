import React, { Component } from "react";
import axios from 'axios';
import GlobalVal from "./GlobalVal";
import { getToken } from "../Authenticator";


export default class Settings extends Component {

  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeMail = this.onChangeMail.bind(this);
    this.onSubmitUsername = this.onSubmitUsername.bind(this);
    this.onSubmitMail = this.onSubmitMail.bind(this);
    this.goBack = this.goBack.bind(this)
    this.onFileUpload = this.onFileUpload.bind(this)
    this.onFileChange = this.onFileChange.bind(this)

    this.state = {
      username: "",
      mail: "",
      previousUsername: "",
      data: "",
      selectedFile: null,
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

  goBack(e) {
    e.preventDefault();
    this.props.history.push("/home");
  }

  onFileChange(e) {
    e.preventDefault();
    this.setState({ selectedFile: e.target.files });
  }

  // This function will handle the submission.
  onSubmitUsername(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      username: this.state.username,
      previousUsername: GlobalVal.username
    };

    try {
      axios.post("http://localhost:80/settings", { user })
      GlobalVal.username = user.username;
      this.setState({ message: "Updated Username" })
    } catch (error) {
      console.log(error);
    }
  }

  onSubmitMail(e) {
    e.preventDefault();

    // When post request is sent to the create url, axios will add a new record(user) to the database.
    const user = {
      mail: this.state.mail,
    };
    try {
      axios.post("http://localhost:80/settings", { user })
      GlobalVal.email = user.mail;
      this.setState({ message: "Updated E-Mail" })
    } catch (error) {
      console.log(error);
    }
  }

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
        } else {
          this.setState({ message: "Error while uploading picture Picture" })
        }
      });
      document.getElementById("upload").value = "";
      this.setState({ selectedFile: null })
    } catch (error) {
      console.log(error);
      this.setState({ message: "Seleact a Picture" })
    }
  }

  // This following section will display the form that takes the input from the user.
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
        <div className="register-form">
          <h1>Settings</h1> <button className="logoutLblPos" onClick={this.goBack}>Back</button>
          <form action="/settings" method="POST" onSubmit={this.onSubmitUsername}>
            <input type="text" name="username" placeholder="Username (6 characters minimum)" minLength="6" onChange={this.onChangeUsername} required></input>
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
      </>
    );
  }
}