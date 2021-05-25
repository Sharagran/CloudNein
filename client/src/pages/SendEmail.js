import React, { Component } from "react";

export default class SendEmail extends Component {
    componentWillMount(){
        setTimeout(() => { 
            this.props.history.push('/');
        }, 5000)
    }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
            <h1>Send Email</h1>
        </>
    );
  }
}