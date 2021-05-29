import React, { Component } from "react";
import GlobalVal from "./GlobalVal";

var dataSize;
var days;

export default class Admin extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this)
      }

    onSubmit(e) {
        e.preventDefault();
        //window.location.reload();
      }

    goBack(e){
        e.preventDefault();
        this.props.history.goBack();
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
            <h1>Admin</h1> <button onClick={this.goBack}>zurück</button>
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
                    <td>{dataSize}</td>
                    <td><input></input></td>
                    <td><button onClick={this.onSubmit}>Bestätigen</button></td>
                    <td>{days}</td>
                    <td><input></input></td>
                    <td><button onClick={this.onSubmit}>Bestätigen</button></td>
                </tr>
            </table>


        </>
    );
  }
}
