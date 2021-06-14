import React, { Component } from "react";
import { Link } from 'react-router-dom';
import './Navvar.css';
import GlobalVal from "./pages/GlobalVal";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = { sidebar: false };

        this.toggleNav = this.toggleNav.bind(this)
    }

    goBack(e) {
        e.preventDefault();
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        GlobalVal.username = null;
        GlobalVal.password = null;
        GlobalVal.loginState = null;
        GlobalVal.id = null;
        window.location = '/';
    }

    toggleNav() {
        var extOnly = document.querySelectorAll('.ext-only');

        if (this.state.sidebar) {
            this.setState({ sidebar: false });
            document.getElementById("sideNav").style.width = "65px";
            document.getElementById("main").style.marginLeft = "65px"; //push content away
            extOnly.forEach(element => {
                element.classList.add('fade-out');
            });
        } else {
            this.setState({ sidebar: true });
            document.getElementById("sideNav").style.width = "250px";
            document.getElementById("main").style.marginLeft = "250px"; //push content away
            extOnly.forEach(element => {
                element.classList.remove('fade-out');
            });
        }

    }

    updateUI() {
        this.forceUpdate();
    }

    render() {
        return (
            <div id="sideNav" class="sidenav">
                <div class="userdata">
                    <span class="ext-only fade-out">USERNAME</span>
                    <img class="ext-only fade-out" src="https://via.placeholder.com/64" />
                    <progress class="ext-only fade-out" id="file" max="100" value="70">70%</progress>
                    <span class="ext-only fade-out">3GB free of 10GB</span>
                </div>
                <Link to="/Storage"><FontAwesomeIcon icon='folder-open' /> Files</Link>
                <Link to="/Upload"><FontAwesomeIcon icon='file-upload' /> Upload</Link>
                <Link to="/Settings"><FontAwesomeIcon icon='sliders-h' /> Settings</Link>
                <Link onClick={this.goBack}><FontAwesomeIcon icon='sign-out-alt' /> Logout</Link>

                <a href="javascript:void(0)" class="togglebtn" onClick={this.toggleNav}><FontAwesomeIcon icon='bars' /></a>
            </div>
        );
    }
}
