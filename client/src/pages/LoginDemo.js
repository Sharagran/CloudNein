import React from 'react'
import axios from 'axios';

export default function LoginDemo() {
    function requestUserID(callback) {
        axios.get("http://warumgehtdiesershitnicht.de:80/newUserid").then(function (res) {
            callback(res.data);
        }).catch(function (error) {
            console.error(error);
        })
    }

    async function authDemo(userid) {
        console.log('Button click');
        var publicKey = {

            challenge: new Uint8Array([21, 31, 105, 55]),

            rp: {
                name: "CloudNein",
                // id: 'https://192.168.178.97'
            },

            user: {
                id: Uint8Array.from(userid),
                name: "alex.p.mueller@example.com",
                displayName: "Alex P. Müller"
            },

            pubKeyCredParams: [
                {
                    type: "public-key", alg: -7 // "ES256" IANA COSE Algorithms registry
                }
            ],

            timeout: 60000
        }

        navigator.credentials.create({ publicKey }).then(creds => {
            console.log(creds);
            const utf8Decoder = new TextDecoder('utf-8');
            const decodedClientData = utf8Decoder.decode(creds.clientDataJSON)
            // parse the string as an object
            const clientDataObj = JSON.parse(decodedClientData);
            axios.post('http://warumgehtdiesershitnicht.de:80/parse', clientDataObj);
        });
        
    }

    return (
        <>
            <h1>Test</h1>
            <button onClick={() => {
                requestUserID(function (userid) {
                    authDemo(userid);
                })
            }}>
                Register
            </button>
        </>
    )
}
