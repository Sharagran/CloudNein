import React, { Component } from "react";
import { Camera } from 'react-html5-camera-photo'
import 'react-html5-camera-photo/build/css/index.css';
import axios from 'axios';
import { getToken } from "../Authenticator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "../Navbar";

var spaceCheck;

export default class Photo extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
        this.handleTakePhoto = this.handleTakePhoto.bind(this);

        this.state = {
            message: ""
        };
    }

    handleTakePhoto(dataUri) {

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
        var dateTime = date + "@" + time;

        var binary = atob(dataUri.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        var photo = new Blob([new Uint8Array(array)], { type: 'image/png' });
        const formData = new FormData();
        formData.append("files", photo, dateTime + ".png");


        const fileSize = {
            fileSize: photo.size
        };

        axios.post("http://localhost:80/uploadCheck", { fileSize }).then((res => {
            spaceCheck = res.data;
            if (spaceCheck) {
                axios.post("http://localhost:80/upload", formData)
                this.setState({ message: "Uploaded photo" });
            } else {
                this.setState({ message: "Not enough space" });
            }
        })).catch(error => {
            console.error(error.stack);
            this.setState({ message: "Error while uploading photo" });
        });
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
                <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
                    <Navbar />
                </React.Suspense>
                <div className="login-form">
                    <h1>Take Photo</h1>
                </div>
                <div id='main'>
                    <button className="logoutLblPos" onClick={this.goBack}>Back</button>
                    <Camera
                        onTakePhoto={(dataUri) => { this.handleTakePhoto(dataUri); }}
                    />
                </div>
                <div className="login-form">
                    <h1>{this.state.message}</h1>
                </div>
            </>
        );

    }
}
