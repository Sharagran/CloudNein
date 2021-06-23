import React, { Component } from "react";
import axios from 'axios';
import 'reactjs-popup/dist/index.css';
import FileList from "../components/FileList";

var fileID;
var shareID;
var confirmCounter = 0;
var usages;
var expired;

/**
 * Page to download shared files from an user.
 */
export default class ShareFile extends Component {
  /**
   * Constructor that stores the data.
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmDownload = this.onConfirmDownload.bind(this);

    this.state = {
      message: "",
      fileName: "",
      files: []
    };
  }

  /**
   * Checks if the share link is expired and fetches the file information with the shareID
   */
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
        var isFolder = res.data.isFolder;
        this.setState({ fileName: res.data.files.name })
        if (isFolder) {
          this.getFiles(fileID);
        } else {
          this.setState({ ...this.state, files: [{ name: this.state.fileName, id: fileID }] });
        }
      })



    } catch (error) {
      console.log(error)
      this.setState({ message: "Error while checking link information" })
    }
  }

  /**
   * Checks wether usages are available. If yes the user is alowed to download the files.
   * Chekks wether the download was already confirmed. If yes the user isn't alowed to download the files.
   * If the links is expired the the user isn't alowed to download the files.
   * @param {*} fileID 
   * @param {*} fileName 
   * @returns void to ending the function.
   */
  onSubmit(fileID, fileName) {
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
            link.setAttribute('download', fileName);
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

  /**
   * Sends the confirmation to the server to decrease the usages in the database.
   * If the links is expired the the user isn't alowed to confirm the download.
   * If the download was elready confiremd the user isn't alowed to confirm it again.
   * if the usage counter is at 0 the user will be redirectet to the "home" page.
   * @returns void to ending the function.
   */
  onConfirmDownload() {
    try {
      if (expired) {
        this.setState({ message: "Confirmation rejected because it's expired" })
        return;
      }

      var shareInformation = {
        shareID: shareID,
        fileID: fileID
      }

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

  /**
   * Get all file information when a complete folder is shared
   * @param {*} fileID 
   */
  getFiles(fileID) {
    axios.post("http://localhost:80/storage", { folderid: fileID }).then(res => {
      console.log(res.data);
      var newFiles = res.data;
      this.setState({ ...this.state, files: newFiles });
    }).catch(error => {
      console.error(error.stack);
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  /**
  * Display the page that takes the input from the user.
  * @returns The shareFile page is displayed.
  */
  render() {
    return (
      <>
        <div id='fileContainer'>
          <FileList files={this.state.files} cd={() => { }} getFolders={() => { return [] }} moveFile={() => { }} areSharedFiles={true} shareDownload={this.onSubmit} />
        </div>
        <div className="shareLink-container">
          <button onClick={this.onConfirmDownload}>Confirm Download</button>
          <h1>{this.state.message}</h1>
        </div>
      </>
    )
  }
}
