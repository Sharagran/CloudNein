import React, { Component } from "react";

export default class Success extends Component {
    componentWillMount(){
        setTimeout(() => { 
            this.props.history.push('/');
        }, 5000)
    }

  // This following section will display the form that takes the input from the user.
  render() {
    return (
        <>
            <h1>Success</h1>
        </>
    );
  }
}