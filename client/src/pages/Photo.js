import React, { Component } from "react";
import {Camera} from 'react-html5-camera-photo'
import 'react-html5-camera-photo/build/css/index.css';
import axios from 'axios';
import { getToken } from "../Authenticator";

var spaceCheck;

export default class Photo extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this)
        this.handleTakePhoto = this.handleTakePhoto.bind(this)

        this.state = {
            message: ""
        }
    }


    handleTakePhoto (dataUri) {
        try {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
            var dateTime = date + "@" + time;
       
            var binary = atob(dataUri.split(',')[1]);
            var array = [];
            for(var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
        
            var photo = new Blob([new Uint8Array(array)], {type: 'image/png'});
            const formData = new FormData();
            formData.append("files", photo, dateTime +".png")
            
            axios.post("http://localhost:80/uploadCheck").then((res => {
                spaceCheck = res.data
                console.log(spaceCheck)
                if(spaceCheck){
                    axios.post("http://localhost:80/upload", formData )
                    this.setState({message: "Uploaded photo"})
                  }else{
                    this.setState({message: "Not enough space"})
                  }
                }));
        } catch (error) {
            console.log(error);
            this.setState({message: "Error while uploading photo"})
        }
    }




    goBack(e){
        e.preventDefault();
        this.props.history.push("/upload");
    }

    render() {
        if(getToken() === ""){
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
            <h1>Take Photo</h1>
            <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
                <Camera
                    onTakePhoto = { (dataUri) => { this.handleTakePhoto(dataUri); } }
                />
                <h1>{this.state.message}</h1>
            </>
        );
        
    }
}