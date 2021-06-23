import React, { Component } from "react";

/**
 * Page that will shown to the user if the registration failed.
 */
export default class Failed extends Component {
    /**
     * Redirects the user after 2 seconds to the login page.
     */
    UNSAFE_componentWillMount() {
        setTimeout(() => {
            this.props.history.push('/');
        }, 2000);
    }

  /**
  * Display the page with the word "Failed".
  * @returns Page with the information that something failed while registration.
  */
    render() {
        return (
            <>
                <div className="login-form">
                    <h1>Failed</h1>
                </div>
            </>
        );
    }
}