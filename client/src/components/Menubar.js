import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Menubar({path, navigateBack}) {
    return (
        <div id="menubar">
            <div id="pathContainer">
                <FontAwesomeIcon icon="folder-open" />{path}
            </div>
            {/* <div id="downloadContainer">
                <FontAwesomeIcon icon="download" />Download
            </div> */}
            <div id="gobackContainer" onClick={navigateBack}>
                <FontAwesomeIcon icon="level-up-alt" /> Zurück
            </div>
        </div>
    )
}
