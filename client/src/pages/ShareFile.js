import React, { Component } from "react";
import axios from 'axios';

var fileName;
var fileID;
var shareID;

export default class ShareFile extends Component {

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount(){
    const queryParams = new URLSearchParams(window.location.search);
    fileName = queryParams.get('fileName');
    fileID = queryParams.get('fileID');
    shareID = queryParams.get('shareID');
}

  onSubmit(e){
    e.preventDefault();

    axios({
      url: 'http://localhost:80/download/'+ fileID,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      console.log(url)
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); 
      console.log(link)
      document.body.appendChild(link);
      link.click();
      this.setState({message: ""})
    });
  }



  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
          <div class="login-form">
            <input type="submit" value={"Download " + fileName}  onClick={this.onSubmit}></input>
          </div>
        </>
    );
  }
}