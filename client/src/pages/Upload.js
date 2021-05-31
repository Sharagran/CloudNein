import React, { Component } from "react";
import axios from 'axios';
import GlobalVal from "./GlobalVal";
import { Link } from 'react-router-dom';

export default class Upload extends Component {

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this)
  }
  state = {
    // Initially, no file is selected
    selectedFile: null
  };
  
  // On file select (from the pop up)
  onFileChange = event => {
    // Update the state
    this.setState({ selectedFile: event.target.files});
  };

  goBack(e){
    e.preventDefault();
    this.props.history.goBack();
  }
  
  // On file upload (click the upload button)
  onFileUpload = () => {
  
    // Create an object of formData
    const formData = new FormData();

    for(var x = 0; x < this.state.selectedFile.length; x++){
      formData.append("files", this.state.selectedFile[x])
    }
  
    // Details of the uploaded file
    console.log(this.state.selectedFile);
    console.log()
    // Request made to the backend api
    // Send formData object
    axios.post("http://localhost:80/upload", formData);
  };

  // This following section will display the form that takes the input from the user.
  render() {
    if(GlobalVal.username == null){
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
              <h1>Upload</h1> <button onClick={this.goBack}>zurück</button>
              <div>
                <input type="file" name="files" onChange={this.onFileChange} multiple/>
                <input type="submit" value="Upload "onClick={this.onFileUpload}></input>
                <Link to="/Photo"><button id="forgotPassword-btn" type="submit" >Take Photo</button></Link>
                <Link to="/Record"><button id="forgotPassword-btn" type="submit" >Record Audio</button></Link>
              </div>
            </div>
        </>
    );
  }
}


