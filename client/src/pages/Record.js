import React, { Component } from "react";
import { Recorder } from 'react-voice-recorder'
import './css/recorder.css'
import axios from 'axios';
import { getToken } from "../Authenticator";

var spaceCheck;
export default class Record extends Component {

  constructor(props) {
    super(props)
    this.goBack = this.goBack.bind(this)

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
      message: " "
    }
  }

  handleAudioStop(data) {
    this.setState({ audioDetails: data });
  }

  handleAudioUpload(file) {
    try {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
      var dateTime = date + "@" + time;
      const formData = new FormData();
      formData.append("files", file, dateTime + ".webm")
      // Request made to the backend api
      // Send formData object

      axios.post("http://localhost:80/uploadCheck").then((res => {
        spaceCheck = res.data
        if (spaceCheck) {
          axios.post("http://localhost:80/upload", formData)
          this.setState({ message: "Uploaded audio" })
        } else {
          this.setState({ message: "Not enough space" })
        }
      }));
    } catch (error) {
      console.log(error);
      this.setState({ message: "Error while uploading audio" })
    }
  }

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

  goBack(e) {
    e.preventDefault();
    this.props.history.push("/upload");
  }

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
        <div className="login-form" >
          <button className="logoutLblPos" onClick={this.goBack}>zurück</button>
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
      </>
    );
  }
}