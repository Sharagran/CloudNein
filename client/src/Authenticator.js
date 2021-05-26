import axios from 'axios';

// Updates header and saves token in cookies
export function setToken(token) {
    setCookie(token);
    updateHeader(token);
}

// Updates header and reads token from cookies
export function getToken() {
    var token = getCookie("token");
    updateHeader(token);
}

function setCookie(token) {
    document.cookie = `token=${token}`;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function updateHeader(token) {
    if (token)
        axios.defaults.headers.common = { 'Authorization': `Bearer ${token}` };
    else
        console.info("No token specified");
}
