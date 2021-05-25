import React, { Component } from "react";
import {Camera} from 'react-html5-camera-photo'
import 'react-html5-camera-photo/build/css/index.css';

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
        return (
            <>
                <Camera
                    onTakePhoto = { (dataUri) => { this.handleTakePhoto(dataUri); } }
                />
            </>
        );
        
    }
}