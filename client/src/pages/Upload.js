import React, { Component } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getToken } from "../Authenticator";

export default class Upload extends Component {

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this)

    this.state = {
      // Initially, no file is selected
      selectedFile: null,
      message: ""
    };
  }

     // Update the state
  onFileChange = event => {
    this.setState({ selectedFile: event.target.files});
  };

  goBack(e){
    e.preventDefault();
    this.props.history.push("/home");
  }
  
  // On file upload (click the upload button)
  onFileUpload = (e) => {
    e.preventDefault();
    try {
          // Create an object of formData
      const formData = new FormData();
          
      for(var x = 0; x < this.state.selectedFile.length; x++){
        formData.append("files", this.state.selectedFile[x])
      }
      axios.post("http://localhost:80/upload", formData);
      this.setState({message: "Uploaded"})
      document.getElementById("upload").value = "";
      this.setState({selectedFile: null})
    } catch (error) {
        console.log(error);
        this.setState({message: "Select a File"})
    }};

  // This following section will display the form that takes the input from the user.
  render() {
    if(getToken() === "") {
      return (
        <>
          <div class="login-form">
            no Permission
          </div>
        </>
      );
    }
    return (
        <>
          <div class="login-form">
              <h1>Upload</h1> <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
              <div>
                <input id="upload" type="file" name="files" onChange={this.onFileChange} multiple/>
                <input type="submit" value="Upload "onClick={this.onFileUpload}></input>
                <Link to="/Photo"><button id="forgotPassword-btn" type="submit" >Take Photo</button></Link>
                <Link to="/Record"><button id="forgotPassword-btn" type="submit" >Record Audio</button></Link>
              </div>
              <h1>{this.state.message}</h1>
            </div>
        </>
    );
  }
}


