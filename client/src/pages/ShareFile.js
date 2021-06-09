import React, { Component } from "react";
import axios from 'axios';

var fileName;
var fileID;
var shareID;

export default class ShareFile extends Component {

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      // Initially, no file is selected
      message: ""
    };
  }

  componentWillMount(){
    const queryParams = new URLSearchParams(window.location.search);
    shareID = queryParams.get('shareID');
    fileName = queryParams.get('fileName');

    var shareInformation = {
      shareID: shareID
    }

    try {
      axios.post("http://localhost:80/getShareInformation", {shareInformation}).then((res) => {
        fileID = res.data.id
      })
    } catch (error) {
      console.log(error)
    }
}

  onSubmit(e){
    e.preventDefault();
    try {
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
    } catch (error) {
        console.log(error)
        this.setState({message: "Error while preparing download"})
    }
  }



  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
          <div class="login-form">
            <input type="submit" value={"Download " + fileName}  onClick={this.onSubmit}></input>
            <h1>{this.state.message}</h1>
          </div>
        </>
    );
  }
}