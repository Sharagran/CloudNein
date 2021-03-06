import React, { Component } from "react";
import { Link } from 'react-router-dom';
import './Navbar.css';
import GlobalVal from "../pages/GlobalVal";
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Sidebar for navigation
 */
export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebar: false,
            image: "",
            usedSpace: "",
            maxSpace: "",
            usedSpacePercent: "",
            freeSpace: ""
        };
        this.toggleNav = this.toggleNav.bind(this)
    }

    /**
     * Get the users profile picture from the server it's available.
     * Get the total upload data limit and the used space  to calculate the free space.
     */
    UNSAFE_componentWillMount() {
        try {
            axios.post("http://localhost:80/getProfilePicture").then((res) => {
                if (res.data) {
                    this.setState({ image: res.data });
                } else {
                    this.setState({ image: "https://via.placeholder.com/64" });
                }
            });
        } catch (error) {
            console.error(error.stack);
        }

        try {
            axios.post("http://localhost:80/getStorageSpaceInformation").then((res) => {
                var freeSpaceRounded = res.data.dataLimit - res.data.usedSpace

                this.setState({
                    maxSpace: res.data.dataLimit,
                    usedSpace: res.data.usedSpace,
                    usedSpacePercent: 100 / res.data.dataLimit * res.data.usedSpace,
                    freeSpace: freeSpaceRounded.toFixed(2)
                })
            })
        } catch (error) {
            console.error(error.stack);
        }
    }

    /**
   * Returns the admin to the login page. The cookie is deleted and all user information.
   * and all user information will be reseted.
   * User will be redirectet to the "login" page
   */
    goBack() {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        GlobalVal.username = null;
        GlobalVal.password = null;
        GlobalVal.loginState = null;
        GlobalVal.id = null;
        window.location = '/';
    }

    /** Toggles (expands/collapse) the side/navigation bar */
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

    /** Force a re-render */
    updateUI() {
        this.forceUpdate();
    }

    render() {
        return (
            <div id="sideNav" className="sidenav">
                {/* Data about the user */}
                <div className="userdata">
                    <span className="ext-only fade-out">{GlobalVal.username}</span>
                    <img className="ext-only fade-out" src={this.state.image} width="64" height="64" />
                    <progress className="ext-only fade-out" id="file" max="100" value={this.state.usedSpacePercent}></progress>
                    <span className="ext-only fade-out">{this.state.freeSpace}MB free of {this.state.maxSpace}MB </span>
                </div>
                {/* Navigation links */}
                <Link to="/Storage"><FontAwesomeIcon icon='folder-open' /> Files</Link>
                <Link to="/Upload"><FontAwesomeIcon icon='file-upload' /> Upload</Link>
                <Link to="/Settings"><FontAwesomeIcon icon='sliders-h' /> Settings</Link>
                <a onClick={this.goBack}><FontAwesomeIcon icon='sign-out-alt' /> Logout</a>

                {/* Toggle side/navigation bar */}
                <a className="togglebtn" onClick={this.toggleNav}><FontAwesomeIcon icon='bars' /></a>
            </div>
        );
    }
}
