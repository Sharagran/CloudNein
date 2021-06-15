import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Menubar({path}) {
    return (
        <div id="menubar">
            <div id="pathContainer">
                <FontAwesomeIcon icon="folder-open" />{path}
            </div>
            <div id="downloadContainer">
                <FontAwesomeIcon icon="download" />Download
            </div>
            <div id="gobackContainer">
                <FontAwesomeIcon icon="level-up-alt" /> Zurück
            </div>
        </div>
    )
}
