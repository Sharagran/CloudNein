import React, { Component } from "react";
import {Camera} from 'react-html5-camera-photo'
import 'react-html5-camera-photo/build/css/index.css';
import GlobalVal from "./GlobalVal";

export default class Photo extends Component {

    constructor(props) {
        super(props);
    }

    handleTakePhoto (dataUri) {
        //FIXME: Do stuff with the photo.
        console.log('photo taken');
        console.log(dataUri);
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
                <Camera
                    onTakePhoto = { (dataUri) => { this.handleTakePhoto(dataUri); } }
                />
            </>
        );
        
    }
}