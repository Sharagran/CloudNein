import React, { Component } from "react";
import {Recorder} from 'react-voice-recorder'
//import './css/recorder.css'

export default class Record extends Component {

    constructor(props) {
        super(props)
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
        console.log(data)
        this.setState({ audioDetails: data });
    }

    handleAudioUpload(file) {
        console.log(file); //FIXME: Do stuff with audio file.
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

    render() {
        return (
            <>
                <Recorder
                    record={true}
                    title={"New recording"}
                    audioURL={this.state.audioDetails.url}
                    showUIAudio
                    handleAudioStop={data => this.handleAudioStop(data)}
                    handleAudioUpload={data => this.handleAudioUpload(data)}
                    handleReset={() => this.handleReset()}
                />
            </>
        );
        
    }
}