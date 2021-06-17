import React, { Component } from "react";
import axios from 'axios';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

var fileID;
var shareID;
var confirmCounter = 0;
var usages;
var expired;

export default class ShareFile extends Component {

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmDownload = this.onConfirmDownload.bind(this);

    this.state = {
      message: "",
      fileName: ""
    };
  }

  UNSAFE_componentWillMount() {
    const queryParams = new URLSearchParams(window.location.search);
    shareID = queryParams.get('shareID');


    var shareInformation = {
      shareID: shareID
    }
    try {
      //Check if Link is expired
      axios.post("http://localhost:80/checkSharelinkExpiration", { shareInformation }).then((res) => {
        if (res.data) {
          expired = res.data
          this.setState({ message: "Sharelink is expired" })
        }
      })

      //Get File Information
      axios.post("http://localhost:80/getShareInformation", { shareInformation }).then((res) => {
        fileID = res.data.files.id
        usages = res.data.sharedFiles.usages
        this.setState({ fileName: res.data.files.name })
      })



    } catch (error) {
      console.log(error)
      this.setState({ message: "Error while checking link information" })
    }
  }

  onSubmit(e) {
    e.preventDefault();
    try {
      if (expired) {
        this.setState({ message: "Download rejected because it's expired" })
        return;
      }

      var shareInformation = {
        shareID: shareID
      }

      if (confirmCounter > 0) {
        this.setState({ message: "You already downloaded and confirmed the download" })
        return;
      }

      //Check for usages
      axios.post("http://localhost:80/checkSharelinkUsages", { shareInformation }).then((res) => {
        if (!res.data) {
          usages = res.data
          axios({
            url: 'http://localhost:80/download/' + fileID,
            method: 'GET',
            responseType: 'blob',
          }).then((res) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.state.fileName);
            document.body.appendChild(link);
            link.click();
            this.setState({ message: "Download successful" })
          });
        } else {
          this.setState({ message: "No usages: redirect after 2 seconds" })
          setTimeout(() => {
            this.props.history.push('/');
          }, 2000)
        }
      })
    } catch (error) {
      console.log(error)
      this.setState({ message: "Error while preparing download" })
    }
  }

  onConfirmDownload(e) {
    e.preventDefault();
    try {
      if (expired) {
        this.setState({ message: "Confirmation rejected because it's expired" })
        return;
      }

      var shareInformation = {
        shareID: shareID,
        fileID: fileID
      }
      console.log(shareInformation);

      if (confirmCounter === 0) {
        axios.post("http://localhost:80/adjustUsages", { shareInformation }).then((res) => {
          if (res.data) {
            this.setState({ message: "Download confirmed" })
            confirmCounter++;
            return;
          } else {
            this.setState({ message: "No usages: redirect after 2 seconds" })
            setTimeout(() => {
              this.props.history.push('/');
            }, 2000)
          }
        })
      } else {
        this.setState({ message: "You have already confirmed the download" })
      }
    } catch (error) {
      console.log(error);
      this.setState({ message: "Error while confirmation" })
    }
  }

  // This following section will display the form that takes the input from the user.
  render() {
    if (usages == null) {
      return (
        <>
          <div className="login-form">
            <Popup trigger={<input value={"Download " + this.state.fileName}></input>} position="bottom center">
              <div>
                <form onSubmit={this.onUpdate}>
                  <input type="submit" value="Download " onClick={this.onSubmit}></input>
                </form>
              </div>
            </Popup>
            <h1>{this.state.message}</h1>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="login-form">
            <Popup trigger={<input value={"Download " + this.state.fileName}></input>} position="bottom center">
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
}