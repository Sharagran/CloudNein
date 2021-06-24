import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Bar on top of view to help navigate through folders
 * @param path current path
 * @param navigateBack function to navigate back/one directory up
 * @return render of Menubar
 */
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
                <FontAwesomeIcon icon="level-up-alt" /> back
            </div>
        </div>
    )
}
