import React, { Component } from "react";
import { Link } from 'react-router-dom';
import './Navbar.css';
import GlobalVal from "./pages/GlobalVal";
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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


    UNSAFE_componentWillMount() {
        //Holt sich das Profilbild
        try {
            axios.post("http://localhost:80/getProfilePicture").then((res) => {
                if (res.data) {
                    this.setState({ image: res.data });
                } else {
                    this.setState({ image: "https://via.placeholder.com/64" });
                }
            });
        } catch (error) {
            console.log(error);
        }
        //Holt sich den gesamten Speicher und den aktuell verwendeten speicher

        try {
            axios.post("http://localhost:80/getStorageSpaceInformation").then((res) => {
                var freeSpaceRounded = res.data.dataLimit - res.data.usedSpace
   
                this.setState({
                    maxSpace: res.data.dataLimit,
                    usedSpace: res.data.usedSpace,
                    usedSpacePercent: 100 / res.data.dataLimit * res.data.usedSpace,
                    freeSpace: freeSpaceRounded.toFixed(2)
                })

                console.log(this.state.freeSpace);
            })
        } catch (error) {
            console.log(error);
        }

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
            <div id="sideNav" className="sidenav">
                <div className="userdata">
                    <span className="ext-only fade-out">{GlobalVal.username}</span>
                    <img className="ext-only fade-out" src={this.state.image} width="64" height="64" />
                    <progress className="ext-only fade-out" id="file" max="100" value={this.state.usedSpacePercent}></progress>
                    <span className="ext-only fade-out">{this.state.freeSpace}MB free of {this.state.maxSpace}MB </span>
                </div>
                <Link to="/Storage"><FontAwesomeIcon icon='folder-open' /> Files</Link>
                <Link to="/Upload"><FontAwesomeIcon icon='file-upload' /> Upload</Link>
                <Link to="/Settings"><FontAwesomeIcon icon='sliders-h' /> Settings</Link>
                <a onClick={this.goBack}><FontAwesomeIcon icon='sign-out-alt' /> Logout</a>

                <a className="togglebtn" onClick={this.toggleNav}><FontAwesomeIcon icon='bars' /></a>
            </div>
        );
    }
}
