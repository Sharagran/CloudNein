import React, { Component } from "react";

var Datenmenge;
var Tage;

export default class Admin extends Component {


    
    onSubmit(e) {
        e.preventDefault();
        window.location.reload();

       

      }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
            <h1>Admin</h1>
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
                    <td>{Datenmenge}</td>
                    <td><input></input></td>
                    <td><button onClick={this.onSubmit}>Bestätigen</button></td>
                    <td>{Tage}</td>
                    <td><input></input></td>
                    <td><button onClick={this.onSubmit}>Bestätigen</button></td>
                </tr>
            </table>


        </>
    );
  }
}
