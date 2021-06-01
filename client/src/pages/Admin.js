import React, { Component } from "react";
import GlobalVal from "./GlobalVal";
import axios from 'axios';


export default class Admin extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this)
        this.onChangeDataSize = this.onChangeDataSize.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.componentWillMount = this.componentWillMount.bind(this);


        this.state = {
          dataSize: "",
          dataSizeNew:"",
          days: ""
        };
      }

    onChangeDataSize(e) {
      this.setState({
         dataSizeNew: e.target.value*1000000,
      });
    }

    onSubmit(e) {
        e.preventDefault();
        const settings = {
          dataSizeNew: this.state.dataSizeNew
        };
        console.log(settings)
        axios.post("http://localhost:80/setDataLimit", {settings}).then((res) => {
          console.log(res)
          
        });
        this.setState({dataSize: settings.dataSizeNew/1000000})
      }

    goBack(e){
        e.preventDefault();
        this.props.history.goBack();
    }

    componentWillMount(){
        axios.post("http://localhost:80/getDataLimit").then((res) => {
         this.setState({dataSize: res.data})
        });
    }

  // This following section will display the form that takes the input from the user.
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
            <h1>Admin</h1> <button class="logoutLblPos" onClick={this.goBack}>zurück</button>
            <table>
                <tr>
                    <th>Datenmenge aktuell in MB</th>
                    <th>Datenmenge neu</th>
                    <th>Datenmenge eingeben</th>
                    <th>Speicherdauer aktuell</th>
                    <th>Speicherdauer neu</th>
                    <th>Speicherdauer eingeben</th>
                </tr>
                <tr>
                    <td>{this.state.dataSize}</td>
                    <td><input onChange={this.onChangeDataSize}></input></td>
                    <td><button onClick={this.onSubmit}>Bestätigen</button></td>
                    <td>{this.state.days}</td>
                    <td><input></input></td>
                    <td><button onClick={this.onSubmit}>Bestätigen</button></td>
                </tr>
            </table>


        </>
    );
  }
}
