import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const file_type = [

    {
        name: 'image',
        icon: 'file-image',
        fileEndings: ['jpg', 'png']
    },
    {
        name: 'audio',
        icon: 'file-audio',
        fileEndings: ['mp3', 'webm']
    }
]


export default function File({ name, isFolder, clickHandler }) {
    var fileIcon;
    if (isFolder) {
        fileIcon = 'folder';
    } else {
        var ending = name.split('.');
        if (ending.length > 1) {
            ending = ending[ending.length - 1];

            var fileType = file_type.find(file_type => file_type.fileEndings.includes(ending));
            if(fileType) {
                fileIcon = fileType.icon;
            } else {
                fileIcon = 'file';
            }
        }
    }

    return (
        <div className="file" onClick={clickHandler}>
            <span className="fileIcon"><FontAwesomeIcon icon={fileIcon} size="2x" /></span>
            <span className="fileName">{name}</span>
        </div>
    )
}
