import React, { Component } from "react";
import axios from 'axios';
import { getToken } from "../Authenticator";
import GlobalVal from "./GlobalVal";

/**
* Admin page to set the maximum upload limit and expiration date.
*/
export default class Admin extends Component {
  /**
   * Constructor that stores the data.
   * @param  props 
   */
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.onChangeDataSize = this.onChangeDataSize.bind(this);
    this.onSubmitDataSize = this.onSubmitDataSize.bind(this);
    this.onSubmitDays = this.onSubmitDays.bind(this);
    this.onChangeDays = this.onChangeDays.bind(this);

    this.state = {
      dataSize: "",
      dataSizeNew: "",
      days: "",
      daysNew: "",
      message: ""
    };
  }

  /**
* When you open the page, the data limit and expiration date in days are retrieved.
* from the database and displayed on the admin page.
*/
  UNSAFE_componentWillMount() {

    axios.post("http://localhost:80/getDataLimit").then((res) => {
      this.setState({ dataSize: res.data });
    }).catch((error) => {
      console.error(error.stack);
      this.setState({ message: "Error while loading datalimit" });
    });

    axios.post("http://localhost:80/getExpirationDate").then((res) => {
      this.setState({ days: res.data });
    }).catch(error => {
      console.error(error.stack);
      this.setState({ message: "Error while loading exploration date" });
    });
  }

  /**
 * Returns the admin to the login page. The cookie is deleted and all user information.
 * and all user information will be reseted.
 */
  goBack() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    GlobalVal.username = null;
    GlobalVal.password = null;
    GlobalVal.loginState = null;
    GlobalVal.id = null;
    this.props.history.push('/');
  }

  /**
   * Adjusts the value in the state for dataSizeNew in byte in terms of the user input.
   * @param  e trigger event.
   */
  onChangeDataSize(e) {
    this.setState({
      dataSizeNew: e.target.value * 1000000
    });
  }

  /**
 * Adjusts the value in the state for daysNew in byte in terms of the user input.
 * @param  e trigger event.
 */
  onChangeDays(e) {
    this.setState({
      daysNew: e.target.value
    });
  }

  /**
   * Sends the new data limit to the server and adjusts it in the database. 
   * The limit is adjusted to the entered limit on the admin's side.
   * @param  e trigger event.
   */
  onSubmitDataSize(e) {
    e.preventDefault();

    const settings = {
      dataSizeNew: this.state.dataSizeNew
    };

    if (settings.dataSizeNew <= 0) {
      this.setState({ message: "Invalid datalimit" });
    } else {
      axios.post("http://localhost:80/setDataLimit", { settings }).catch(error => {
        console.error(error.stack);
        this.setState({ message: "Error while updating datalimit" });
      });
      this.setState({ dataSize: settings.dataSizeNew / 1000000 });
      this.setState({ message: "Updated datalimit" });
    }
  }

  /**
 * Sends the new expiration date to the server and adjusts it in the database. 
 * The days are adjusted to the entered days on the admin's side.
 * @param  e trigger event.
 */
  onSubmitDays(e) {
    e.preventDefault();

    const settings = {
      daysNew: this.state.daysNew
    };

    if (settings.daysNew <= 0) {
      this.setState({ message: "Invalid exploration date" })
    } else {
      axios.post("http://localhost:80/setExpirationDate", { settings }).catch(error => {
        console.error(error.stack);
        this.setState({ message: "Error while updating exploration date" });
      });
      this.setState({ days: settings.daysNew });
      this.setState({ message: "Updated exploration date" });
    }
  }

  /**
  * Display the page that takes the input from the user.
  * @returns If no token is present an "Access Denied" page is displayed , otherwise the regular admin page.
  */
  render() {
    if (getToken() === "") {
      return (
        <>
          <div className="container-center">
            no Permission
          </div>
        </>
      );
    }
    return (
      <>
        <div className="container-center">
          <h1>Admin</h1>
          <button className="logoutLblPos" onClick={this.goBack}>Back</button>
          <table>
            <tr>
              <th>Datalimit in MB</th>
              <th>New datalimit</th>
            </tr>
            <tr>
              <td>{this.state.dataSize}</td>
              <td><input type="number" min="1" onChange={this.onChangeDataSize}></input></td>
              <td><button onClick={this.onSubmitDataSize} >Submit</button></td>
            </tr>
            <tr>
              <th>Expiress in days</th>
              <th>new storage duration </th>
            </tr>
            <tr>
              <td>{this.state.days}</td>
              <td><input type="number" min="1" onChange={this.onChangeDays}></input></td>
              <td><button onClick={this.onSubmitDays}>Submit</button></td>
            </tr>
          </table>
          <h1>{this.state.message}</h1>
        </div>
      </>
    );
  }
}
