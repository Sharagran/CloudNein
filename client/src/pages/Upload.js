import React, { Component } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getToken } from "../Authenticator";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "../Navbar";

var spaceCheck;

export default class Upload extends Component {

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
    this.onFileUpload = this.onFileUpload.bind(this)

    this.state = {
      // Initially, no file is selected
      selectedFile: null,
      message: ""
    };
  }

  // Update the state
  onFileChange(e) {
    this.setState({ selectedFile: e.target.files });
  }

  goBack(e) {
    e.preventDefault();
    this.props.history.push("/home");
  }

  // On file upload (click the upload button)
  onFileUpload(e) {
    e.preventDefault();
    try {
      // Create an object of formData
      const formData = new FormData();

      for (var x = 0; x < this.state.selectedFile.length; x++) {
        formData.append("files", this.state.selectedFile[x])
      }

      var sizeFiles = 0;
      for (var i = 0; i < this.state.selectedFile.length; i++) {
        sizeFiles += document.getElementById('upload').files[i].size;
      }

      const fileSize = {
        fileSize: sizeFiles
      }

      axios.post("http://localhost:80/uploadCheck", { fileSize }).then((res => {
        spaceCheck = res.data
        if (spaceCheck) {
          axios.post("http://localhost:80/upload", formData);
          this.setState({ message: "Uploaded" })
          document.getElementById("upload").value = "";
          this.setState({ selectedFile: null })
        } else {
          this.setState({ message: "Not enough space" })
          this.setState({ selectedFile: null })
        }
      }));
    } catch (error) {
      console.log(error);
      this.setState({ message: "Select a File" })
    }
  }

  // This following section will display the form that takes the input from the user.
  render() {
    if (getToken() === "") {
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
          <div className="login-form">
            <h1>Upload</h1> <button className="logoutLblPos" onClick={this.goBack}>Back</button>
            <div>
              <input id="upload" type="file" name="files" onChange={this.onFileChange} multiple />
              <input type="submit" value="Upload " onClick={this.onFileUpload}></input>
              <Link to="/Photo"><button id="forgotPassword-btn" type="submit" >Take Photo</button></Link>
              <Link to="/Record"><button id="forgotPassword-btn" type="submit" >Record Audio</button></Link>
            </div>
            <h1>{this.state.message}</h1>
          </div>
        </div>
      </>
    );
  }
}


