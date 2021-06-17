import React, { Component } from "react";
import axios from 'axios';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { getToken } from "../Authenticator";

var fileID;
var data;
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

    this.state = {
      // Initially, no file is selected
      selectedFile: null,
      message: "",
      tag: "",
      comment: "",
      email: "",
      days: "",
      usages: null
    };
  }

  goBack(e) {
    e.preventDefault();
    this.props.history.push("/home")
  }

  onChangeTag(e) {
    this.setState({ tag: e.target.value });
  }

  onChangeComment(e) {
    this.setState({ comment: e.target.value });
  }

  onChangEmail(e) {
    this.setState({ email: e.target.value });
  }

  onChangeDays(e) {
    this.setState({ days: e.target.value });
  }

  UNSAFE_componentWillMount() {
    try {
      axios.post("http://localhost:80/storage").then((res) => {
          data = res.data

          //Split für Filename
          // for (var i = 0; i < res.data.length; i++) {
          //   var str = data[i].path  //FIXME path -> name
          //   fileName[i] = str.substring(str.lastIndexOf("/") + 1, str.length)
          // }

          for (var j = 0; j < res.data.length; j++) {
            var tr = document.createElement('tr');
            document.getElementById('storageData').appendChild(tr);
            var th1 = document.createElement('th');
            tr.appendChild(th1);
            th1.name = "Andre"
            th1.innerHTML += data[j].name; //fileName[j];
            var th2 = document.createElement('th');
            tr.appendChild(th2);
            th2.id = "tag" + j
            th2.innerHTML = "-" + data[j].tags;
            var th3 = document.createElement('th');
            tr.appendChild(th3);
            th3.id = "comment" + j
            th3.innerHTML = "-" + data[j].comment
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
          axios.post("http://localhost:80/updateFileInformation", { fileInforamtion })

          if (fileInforamtion.tag.length > 0) {
            document.getElementById("tag" + i).innerHTML = document.getElementById("tag" + i).innerHTML + "," + fileInforamtion.tag;
          }

          if (fileInforamtion.comment.length > 0) {
            document.getElementById("comment" + i).innerHTML = fileInforamtion.comment;
          }

          this.setState({ message: "Updated" })
          this.setState({ tag: "" })
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
          fileID = data[i].id;
          file = data[i].name;
          break;
        } else if (i === data.length - 1 && !document.getElementById(data.length - 1).checked) {
          this.setState({ message: "Select a File" })
          return
        }
      }

      // When post request is sent to the create url, axios will add a new record(user) to the database.
      axios({
        url: 'http://localhost:80/download/' + fileID,
        method: 'GET',
        responseType: 'blob',
      }).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file);
        document.body.appendChild(link);
        link.click();
        this.setState({ message: "" })
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
          var allEmails = this.state.email.split(",")
          var counter;
          fileID = data[i].id;

          if (document.getElementById("deleteAfterDownload").checked) {
            counter = allEmails.length
          }

          const shareInformation = {
            email: allEmails,
            days: this.state.days,
            fileID: data[i].id,
            fileName: data[i].name,
            usages: counter
          }

          axios.post("http://localhost:80/share", { shareInformation })
          this.setState({ message: "Links send" })
          break;
        } else if (i === data.length - 1 && !document.getElementById(data.length - 1).checked) {
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
          <div className="login-form">
            no Permission
          </div>
        </>
      );
    }
    return (
      <>
        <div className="login-form">
          <h1>Storage</h1>
          <button className="logoutLblPos" onClick={this.goBack}>Back</button>
          <table id="storageData">
          </table >
          <input id="download_btn" type="submit" value="Download" onClick={this.onSubmit}></input>
          <Popup trigger={<button> Update Tag or Comment</button>} position="bottom center">
            <div>
              <form onSubmit={this.onUpdate}>
                <input type="text" name="tags" placeholder="Tag" onChange={this.onChangeTag}></input>
                <input type="text" name="comments" placeholder="Comment" onChange={this.onChangeComment}></input>
                <input type="submit" value="Update"></input>
              </form>
            </div>
          </Popup><br></br>
          <Popup trigger={<button> Share Files</button>} position="bottom center">
            <div>
              <form onSubmit={this.onShare}>
                <input type="text" name="mail" placeholder="Email * More than one email, Please seperate with comma (,)" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$+,[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" onChange={this.onChangEmail} required></input>
                <input type="number" name="comments" placeholder="Days untill expires" min="1" max="7" onChange={this.onChangeDays} required></input>
                <div>
                  <input id="deleteAfterDownload" type="checkbox"></input>
                  <label>Delete after download</label>
                </div>
                <input type="submit" value="Share"></input>
              </form>
            </div>
          </Popup>
          <h1>{this.state.message}</h1>
        </div>
      </>
    );
  }
}
