import React, { Component } from "react";
import axios from 'axios';

export default class Storage extends Component {

  state = {
    // Initially, no file is selected
    selectedFile: null
  };
  
  // On file select (from the pop up)
  onFileChange = event => {
  
    // Update the state
    this.setState({ selectedFile: event.target.files});
  
  };
  
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
    return (
        <>
          <div>
              <h1>Upload</h1>
              <div>
                <input type="file" name="files" onChange={this.onFileChange} multiple/>
                <input type="submit" onClick={this.onFileUpload}></input>
              </div>
            </div>
        </>
    );
  }
}


