import React, { Component } from "react";
import axios from 'axios';
import { getToken } from "../Authenticator";
import GlobalVal from "./GlobalVal";

export default class Admin extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this)
        this.onChangeDataSize = this.onChangeDataSize.bind(this)
        this.onSubmitDataSize = this.onSubmitDataSize.bind(this)
        this.componentWillMount = this.componentWillMount.bind(this)
        this.onSubmitDays = this.onSubmitDays.bind(this)
        this.onChangeDays = this.onChangeDays.bind(this)

        this.state = {
          dataSize: "",
          dataSizeNew:"",
          days: "",
          daysNew: "",
          message: ""
        };
      }

    onChangeDataSize(e) {
      this.setState({
         dataSizeNew: e.target.value*1000000,
      });
    }

    onChangeDays(e) {
      this.setState({
        daysNew: e.target.value,
      });
    }

    onSubmitDataSize(e) {
        e.preventDefault();
        try {
          const settings = {
            dataSizeNew: this.state.dataSizeNew
          };
          console.log(settings)
          axios.post("http://localhost:80/setDataLimit", {settings}).then((res) => {
            console.log(res)
          });
          this.setState({dataSize: settings.dataSizeNew/1000000})
          this.setState({message: "Updated datalimit"})
        } catch (error) {
          console.log(error)
          this.setState({message: "Error while updating datalimit"})
        }

      }

    onSubmitDays(e){
        try {
          const settings = {
            daysNew: this.state.daysNew
          };
          console.log(settings)
          axios.post("http://localhost:80/setExpirationDate", {settings}).then((res) => {
            console.log(res)
          });
          this.setState({days: settings.daysNew})
          this.setState({message: "Updated exploration date"})
        } catch (error) {
          console.log(error)
          this.setState({ message: "Error while updating exploration date"})
        }

      }

    goBack(e){
        e.preventDefault();
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        GlobalVal.username = null;
        GlobalVal.password = null;
        GlobalVal.loginState = null;
        GlobalVal.id= null;
        this.props.history.push('/')
    }

    componentWillMount(){
      try {
        axios.post("http://localhost:80/getDataLimit").then((res) => {
          this.setState({dataSize: res.data})
         });
 
         axios.post("http://localhost:80/getExpirationDate").then((res) => {
           console.log(res.data)
           this.setState({days: res.data})
          });
      } catch (error) {
        console.log(error)
        this.setState({ message: "Error while loading datalimit or exploration date"})
      }
    }

  // This following section will display the form that takes the input from the user.
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
                    <td><input type="number" min="1" onChange={this.onChangeDataSize}></input></td>
                    <td><button onClick={this.onSubmitDataSize} >Bestätigen</button></td>
                    <td>{this.state.days}</td>
                    <td><input type="number" min="1" onChange={this.onChangeDays}></input></td>
                    <td><button onClick={this.onSubmitDays}>Bestätigen</button></td>
                </tr>
            </table>
            <h1>{this.state.message}</h1>
        </>
    );
  }
}
