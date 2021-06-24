import React, { Component } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getToken } from "../Authenticator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "../components/Navbar";

var spaceCheck;

/**
 * Page to upload files to the server and redirect the user to the apges "photo" and "audio".
 */
export default class Upload extends Component {
  /**
  * Constructor that stores the data.
  * @param  props 
  */
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);

    this.state = {
      selectedFile: null,
      message: ""
    };
  }

  /**
   * Adjusts the value in the state for selected files in terms of the file input.
   * @param  e trigger event.
   */
  onFileChange(e) {
    this.setState({ selectedFile: e.target.files });
  }

  /**
  * Redirects the user to the "home" page.
  */
  goBack() {
    this.props.history.push("/home");
  }

  /**
   * Sends files that was selected from the user to store it at the server.
   * @param  e trigger event.
   */
  onFileUpload(e) {
    e.preventDefault();

    // Create an object of formData
    const formData = new FormData();
    try {
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


      axios.post("http://localhost:80/uploadCheck", { fileSize }).then(res => {
        spaceCheck = res.data;
        if (spaceCheck) {
          axios.post("http://localhost:80/upload", formData);
          this.setState({ message: "Uploaded" });
          document.getElementById("upload").value = "";
          this.setState({ selectedFile: null });
        } else {
          this.setState({ message: "Not enough space" });
          this.setState({ selectedFile: null });
        }
      }).catch(error => {
        console.error(error.stack);
        this.setState({ message: "Error while uploading file" });
      });
    } catch (error) {
      console.error(error.stack);
      this.setState({ message: "Select a File" });
    }
  }

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present an "Access Denied" page is displayed , otherwise the regular "upload" page.
  */
  render() {
    if (getToken() === "") {
      return (
        <>
          <div className="container-center">
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
          <div className="container-center">
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


