import React, { Component } from "react";
import axios from 'axios';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

var fileName;
var fileID;
var shareID;
var confirmCounter = 0;
var usages;

export default class ShareFile extends Component {

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmDownload = this.onConfirmDownload.bind(this);

    this.state = {
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

    //Check if Link is expired
    axios.post("http://localhost:80/checkSharelinkExpiration", {shareInformation}).then((res) => {
      if(res.data){
        this.setState({message: "Sharelink is expired"})
        return;
      }
    })

    //Get File Information
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

    var shareInformation = {
      shareID: shareID
    }

    if(confirmCounter > 0){
      this.setState({message: "You already downloaded and confirmed the download"})
      return;
    }

    //Check for usages

    axios.post("http://localhost:80/checkSharelinkUsages", {shareInformation}).then((res) => {
      if(!res.data){
        usages = res.data
      }
    })

    //FIXME:  Wechsel von True auf False nach dem dein Eintrag in DB gelöscht wurde
    if(usages){
      this.setState({message: "No more usages available"})
      return
    }
  

    //Download
    try {
      axios({
        url: 'http://localhost:80/download/'+ fileID,
        method: 'GET',
        responseType: 'blob',
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); 
        document.body.appendChild(link);
        link.click();
        this.setState({message: "Download successful"})

      });
    } catch (error) {
        console.log(error)
        this.setState({message: "Error while preparing download"})
    }
  }

  onConfirmDownload(e){
    e.preventDefault();

    var shareInformation = {
      shareID: shareID
    }
    if(confirmCounter === 0){
      axios.post("http://localhost:80/decreaseUsages", {shareInformation}).then((res) => {
        console.log(res.data);
        if(res.data){
          this.setState({message: "Download confirmed"})
          confirmCounter ++;
          return;
        }
      })     
    }else {
      this.setState({message: "You have already confirmed the download"})
    }
  }


  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
          <div className="login-form">
            <Popup trigger={<input value={"Download " + fileName}></input>} position="bottom center">
            <div>
              <form onSubmit={this.onUpdate}>
                <input type="submit" value="Download " onClick={this.onSubmit}></input>
                <input type="submit" value="Confirm successful download" onClick={this.onConfirmDownload}></input>
              </form>
            </div>
          </Popup>
            <h1>{this.state.message}</h1>
          </div>
        </>
    );
  }
}