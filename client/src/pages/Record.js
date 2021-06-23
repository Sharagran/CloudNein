import React, { Component } from "react";
import { Recorder } from 'react-voice-recorder'
import './css/recorder.css'
import axios from 'axios';
import { getToken } from "../Authenticator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "../Navbar";

var spaceCheck;

/**
 * Page to take audio records in the application.
 */
export default class Record extends Component {

  /**
  * Constructor that stores the data.
  * @param {*} props 
  */
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);

    this.state = {
      audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: 0,
          m: 0,
          s: 0
        }
      },
      message: ""
    };
  }

  /**
   * Ends the audio recording and adjust the data to the state
   * @param {*} data Recorded audio data
   */
  handleAudioStop(data) {
    this.setState({ audioDetails: data });
  }

  /**
   * A audio record is created from the application and send it to the server after storage space check is true.
   * The name of the file consists of year - month - day @ hour - minute - second.
   * @param {*} data Recorded audio data
   */
  handleAudioUpload(data) {

    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    var dateTime = date + "@" + time;

    try {
      const formData = new FormData();
      formData.append("files", data, dateTime + ".webm");

      const fileSize = {
        fileSize: data.size
      };

      axios.post("http://localhost:80/uploadCheck", { fileSize }).then((res => {
        spaceCheck = res.data
        if (spaceCheck) {
          axios.post("http://localhost:80/upload", formData);
          this.setState({ message: "Uploaded audio" });
        } else {
          this.setState({ message: "Not enough space" });
        }
      })).catch(error => {
        console.error(error.stack);
        this.setState({ message: "Error while uploading audio" });
      });
    } catch (error) {
      console.error(error.stack);
      this.setState({ message: "Reacord audio before uploading" });
    }
  }

  /**
   * Resets the audo data from the state
   */
  handleReset() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0
      }
    };
    this.setState({ audioDetails: reset });
  }

  /**
  * Redirects the user to the "upload" page.
  */
  goBack() {
    this.props.history.push("/upload");
  }

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present an "Access Denied" page is displayed , otherwise the regular "record" page.
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
          <div className="container-center" >
            <button className="logoutLblPos" onClick={this.goBack}>Back</button>
            <Recorder
              record={true}
              title={"New recording"}
              audioURL={this.state.audioDetails.url}
              showUIAudio
              handleAudioStop={data => this.handleAudioStop(data)}
              handleAudioUpload={data => this.handleAudioUpload(data)}
              handleReset={() => this.handleReset()}
              mimeTypeToUseWhenRecording={`audio/webm`}
            />
            <h1>{this.state.message}</h1>
          </div>
        </div>
      </>
    );
  }
}
