import React, { Component } from "react";
import {Recorder} from 'react-voice-recorder'
import './css/recorder.css'
import GlobalVal from "./GlobalVal";
import axios from 'axios';


export default class Record extends Component {

    constructor(props) {
        super(props)
        this.goBack = this.goBack.bind(this)
    }

    state = {
        audioDetails: {
            url: null,
            blob: null,
            chunks: null,
            duration: {
              h: 0,
              m: 0,
              s: 0
            }
          }
    }

    handleAudioStop(data){
        //console.log(data)
        this.setState({ audioDetails: data });
    }

    handleAudioUpload(file) {
        console.log(file); 
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
        var dateTime = date + "@" + time;
        
        const formData = new FormData();
        formData.append("files", file, "Audio-" + dateTime +".webm")
        // Request made to the backend api
        // Send formData object
        axios.post("http://localhost:80/upload", formData);
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

    goBack(e){
      e.preventDefault();
      this.props.history.goBack();
    }

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
            <div class="login-form" >
            <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
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
            </div>

            </>
        );
        
    }
}