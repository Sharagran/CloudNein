import React, { Component } from "react";

export default class Success extends Component {

    UNSAFE_componentWillMount() {
        setTimeout(() => {
            this.props.history.push('/');
        }, 2000);
    }

    // This following section will display the form that takes the input from the user.
    render() {
        return (
            <>
                <div className="login-form">
                    <h1>Success</h1>
                </div>
            </>
        );
    }
}