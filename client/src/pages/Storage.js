import React, { Component } from "react";
import axios from 'axios';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { getToken } from "../Authenticator";

var fileID;
var data;
var fileName = [];
var file;

export default class Storage extends Component {

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onChangeTag = this.onChangeTag.bind(this);
    this.onChangeComment = this.onChangeComment.bind(this);
    this.onChangEmail = this.onChangEmail.bind(this);
    this.onChangeDays = this.onChangeDays.bind(this);
    this.onShare = this.onShare.bind(this);
  }

  state = {
    // Initially, no file is selected
    selectedFile: null,
    message: "",
    tag: "",
    comment: "",
    email: "",
    days: ""
  };

  goBack(e) {
    e.preventDefault();
    this.props.history.push("/home")
  }

  onChangeTag(e) {
    this.setState({
      tag: e.target.value
    });
  }
  onChangeComment(e) {
    this.setState({
      comment: e.target.value
    });
  }
  onChangEmail(e) {
    this.setState({
      email: e.target.value
    });
  }
  onChangeDays(e) {
    this.setState({
      days: e.target.value
    });
  }

  componentWillMount() {

    try {
      axios
        .post("http://localhost:80/storage")
        .then((res) => {
          data = res.data

          //Split für Filename
          for (var i = 0; i < res.data.length; i++) {
            var str = data[i].path
            fileName[i] = str.substring(str.lastIndexOf("/") + 1, str.length)
          }

          for (var j = 0; j < res.data.length; j++) {
            var tr = document.createElement('tr');
            document.getElementById('storageData').appendChild(tr);
            var th1 = document.createElement('th');
            tr.appendChild(th1);
            th1.name = "Andre"
            th1.innerHTML += fileName[j];
            var th2 = document.createElement('th');
            tr.appendChild(th2);
            th2.id = "tag" + j
            th2.innerHTML = "-" + data[j].tags;
            var th3 = document.createElement('th');
            tr.appendChild(th3);
            th3.id = "comment" + j
            th3.innerHTML = "-" + data[j].comments
            var th4 = document.createElement('th');
            tr.appendChild(th4);
            var input = document.createElement('input');
            input.id = j
            input.type = "radio"
            input.name = "selectedFile"
            input.value = j
            th4.appendChild(input)
            this.setState({ message: "" })
          }
        });
    } catch (error) {
      console.log(error);
      this.setState({ message: "Error while loading Files" })
    }
  }

  onUpdate(e) {
    e.preventDefault();
    try {
      for (var i = 0; i < data.length; i++) {
        if (document.getElementById(i).checked) {
          const fileInforamtion = {
            tag: this.state.tag,
            comment: this.state.comment,
            fileID: data[i].id
          }
          console.log(fileInforamtion)
          axios.post("http://localhost:80/updateFileInformation", { fileInforamtion }).then((res) => {
            console.log(res.data)
          })
          document.getElementById("tag" + i).innerHTML = fileInforamtion.tag;
          document.getElementById("comment" + i).innerHTML = fileInforamtion.comment;
          this.setState({ message: "Updated" })
          break;
        } else {
          this.setState({ message: "Select a File" })
        }
      }
    } catch (error) {
      console.log(error)
      this.setState({ message: "Error while updating tags and comments" })
    }
  }


  onSubmit(e) {
    e.preventDefault();
    try {
      for (var i = 0; i < data.length; i++) {
        if (document.getElementById(i).checked) {
          console.log(i);
          fileID = data[i].id;
          file = fileName[i];
          break;
        } else if(i === data.length - 1 && !document.getElementById(data.length - 1).checked) {
          this.setState({ message: "Select a File" })
          return
        }
      }
  
      // When post request is sent to the create url, axios will add a new record(user) to the database.
      console.log(fileID);
      axios({
        url: 'http://localhost:80/download/' + fileID,
        method: 'GET',
        responseType: 'blob',
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        console.log(url)
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file);
        console.log(link)
        document.body.appendChild(link);
        link.click();
        this.setState({ message: ""})
      });
    } catch (error) {
      console.log(error)
      this.setState({ message: "Error while preparing download" })
    }
  }

  onShare(e) {
    e.preventDefault();

    try {
      for (var i = 0; i < data.length; i++) {
        if (document.getElementById(i).checked) {
          console.log(i);
          fileID = data[i].id;
  
          const shareInformation = {
            email: this.state.email,
            days: this.state.days,
            fileID: data[i].id,
            fileName: fileName[i]
          }
  
          axios.post("http://localhost:80/share", { shareInformation }).then((res) => {
            console.log(res.data)
          })
          this.setState({ message: ""})
          break;
        } else if(i === data.length - 1 && !document.getElementById(data.length - 1).checked) {
          this.setState({ message: "Select a File" })
        }
      }
    } catch (error) {
      console.log(error)
      this.setState({ message: "Error while creating the share Link " })
    }
  }

  // This following section will display the form that takes the input from the user.
  render() {
    if (getToken() === "") {
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
        <div class="login-form">
          <h1>Storage</h1>
          <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
          <table id="storageData">
          </table >
          <input id="download_btn"type="submit" value="Download" onClick={this.onSubmit}></input>
          <Popup trigger={<button> Update Tag or Comment</button>} position="bottom center">
            <div>
              <input type="text" name="tags" placeholder="Tag" onChange={this.onChangeTag}></input>
              <input type="text" name="comments" placeholder="Comment" onChange={this.onChangeComment}></input>
              <input type="submit" value="Update" onClick={this.onUpdate}></input>
            </div>
          </Popup><br></br>
          <Popup trigger={<button> Share Files</button>} position="bottom center">
            <div>
              <input type="text" name="mail" placeholder="Email" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangEmail} required></input>
              <input type="number" name="comments" placeholder="Days untill expires" min="1" max="7" onChange={this.onChangeDays} required></input>
              <input type="submit" value="Share" onClick={this.onShare}></input>
            </div>
          </Popup>
          <h1>{this.state.message}</h1>
        </div>
      </>
    );
  }
}