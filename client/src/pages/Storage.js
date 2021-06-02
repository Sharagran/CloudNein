import React, { Component } from "react";
import axios from 'axios';
import GlobalVal from "./GlobalVal";

var fileID;
var data;
var fileName = [];
var file;
var message;

export default class Storage extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this)
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
      }

      state = {
        // Initially, no file is selected
        selectedFile: null,
        message: ""
      };

      goBack(e){
        e.preventDefault();
        this.props.history.goBack();
      }     
      
      onChangeCheckbox(e){
        this.setState({
          selectedFile: e.target.value,
        });
        console.log("this.state.selectedFile")
      }

     componentWillMount(){
          const user = {
            username: GlobalVal.username,
          };
  
          axios
            .post("http://localhost:80/storage", {user})
            .then((res) => {

              data = res.data

              //Split für Filename
              for(var i = 0; i <res.data.length; i++){
                var str = data[i].path
                fileName[i] = str.substring(str.lastIndexOf("/")+1, str.length)
              }

              for(var i = 0; i < res.data.length; i++){
                var tr = document.createElement('tr');
                document.getElementById('storageData').appendChild(tr);
                var th1 = document.createElement('th');
                tr.appendChild(th1);
                th1.name = "Andre"
                th1.innerHTML += fileName[i];
                var th2 = document.createElement('th');
                tr.appendChild(th2);
                var input = document.createElement('input');
                input.id = i
                input.type = "radio"
                input.name = "selectedFile"
                input.value = i
                th2.appendChild(input)
              }
            });

    }

    onSubmit(e) {
      e.preventDefault();

      for(var i = 0; i <data.length; i++){
        if(document.getElementById(i).checked) {
          console.log(i);
          fileID = data[i].id;
          file = fileName[i];
          break;
        }else{
          
        }
      }
        // When post request is sent to the create url, axios will add a new record(user) to the database.
        console.log(fileID);
        axios({
          url: 'http://localhost:80/download/'+ fileID,
          method: 'GET',
          responseType: 'blob',
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          console.log(url)
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', file); //TODO: Dateiname abhängig von der fileID machen
          document.body.appendChild(link);
          link.click();
        });

  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
            <div class="login-form">
              <h1>Storage</h1> 
              <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
              <table id="storageData">

              </table >
              <input type="submit" value="Download" onClick={this.onSubmit}></input>
              <h1>{this.message}</h1>
            </div>
        </>
    );
  }
}