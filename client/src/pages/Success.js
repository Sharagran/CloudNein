import React, { Component } from "react";

/**
 * Page that will shown to the user if registration worked
 */
export default class Success extends Component {
    /**
     * Redirects the user after 2 seconds to the login page
     */
    UNSAFE_componentWillMount() {
        setTimeout(() => {
            this.props.history.push('/');
        }, 2000);
    }

    /**
    * Display the page with the word "Success"
    * @returns Page with the information that something worked
    */
    render() {
        return (
            <>
                <div className="container-center">
                    <h1>Success</h1>
                    <h1>Redirect after 2 seconds</h1>
                </div>
            </>
        );
    }
}