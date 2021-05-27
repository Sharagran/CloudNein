import React, { Component } from "react";
import axios from 'axios';

export default class Storage extends Component {

  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null
      }
  }

  onChangeHandler=event=>{
    this.setState({
     selectedFile: event.target.files,
    })
  }

  onClickHandler = () => {
    const data = new FormData()
    for(var x = 0; x<this.state.selectedFile.length; x++) {
        data.append('file', this.state.selectedFile[x])
       
    }
    console.log(data)
  axios.post("http://localhost:80/upload", data, { 
  }).then(res => { // then print response status
    console.log(res.statusText)
  })
  }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
            <h1>Storage</h1>

            <form action="/upload" methode="post" encType="multipart/form-data">
              <label >Select files:</label>
              <input type="file"  name="files" multiple required></input>
              <input type="submit" onClick={this.onClickHandler}></input>
            </form>
        </>
    );
  }
}
