import React, { Component } from "react";

/**
 * Page that will shown to the user if an email was send
 */
export default class SendEmail extends Component {
    /**
     * Redirects the user after 2 seconds to the login page
     */
  UNSAFE_componentWillMount() {
    setTimeout(() => {
      this.props.history.push('/');
    }, 2000);
  }

  /**
  * Display the page with the word "Send Mail"
  * @returns Page with the information that an Email is send
  */
  render() {
    return (
      <div className="login-form">
        <h1>Send Mail</h1>
      </div>
    );
  }
}