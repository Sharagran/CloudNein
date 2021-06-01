import React, { Component } from "react";
import axios from 'axios';
import GlobalVal from "./GlobalVal";

var fileID;
var data;

export default class Storage extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this)
        this.onSubmit = this.onSubmit.bind(this);
      }

      goBack(e){
        e.preventDefault();
        this.props.history.goBack();
      }      

     componentWillMount(){
          const user = {
            username: GlobalVal.username,
          };
  
          axios
            .post("http://localhost:80/storage", {user})
            .then((res) => {
                data = res.data
                console.log(data)
                var ul = document.createElement('ul');
                document.getElementById('storageData').appendChild(ul);
                data.forEach(function (item) {
                var li = document.createElement('li');
                ul.appendChild(li);
                li.innerHTML += item;
              });
            });

    }

    onSubmit(e) {
      e.preventDefault();
        // When post request is sent to the create url, axios will add a new record(user) to the database.
        axios({
          url: 'http://localhost:80/download/'+ fileID,
          method: 'GET',
          responseType: 'blob',
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          console.log(url)
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Test-file'); //TODO: Dateiname abhängig von der fileID machen
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
              <div id="storageData">
              </div>
              <input type="submit" value="Download" onClick={this.onSubmitMail}></input>
            </div>
        </>
    );
  }
}