import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Popup from 'reactjs-popup';

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
            if (fileType) {
                fileIcon = fileType.icon;
            } else {
                fileIcon = 'file';
            }
        }
    }

    const FileButton = React.forwardRef(({ open, ...props }, ref) => (
        <div className="file" onClick={clickHandler} ref={ref} {...props}>
            <span className="fileIcon"><FontAwesomeIcon icon={fileIcon} size="2x" /></span>
            <span className="fileName">{name}</span>
        </div>
    ));


    return (
        <Popup
            trigger={<FileButton />} {/* TODO add tooltip */}
            position="bottom"
            // contentStyle={{ padding: '0px', border: 'none' }}
            arrow={true}
            nested
        >

            <div className="file-menu">
                <div className="menu-item">Download</div>
                <div className="menu-item">Share</div> {/* TODO Add modal */}
                <div className="menu-item">Edit</div> {/* TODO Add modal */}
                <Popup trigger={<div className="menu-item">Delete</div>} modal nested>
                    {close => (
                        <div className=".modal-content">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="header"> Modal Title </div>
                            <div className="conten">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, a nostrum.
                                Dolorem, repellat quidem ut, minima sint vel eveniet quibusdam voluptates
                                delectus doloremque, explicabo tempore dicta adipisci fugit amet dignissimos?
                                <br />
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur sit
                                commodi beatae optio voluptatum sed eius cumque, delectus saepe repudiandae
                                explicabo nemo nam libero ad, doloribus, voluptas rem alias. Vitae?
                            </div>
                            <button className="button" onClick={() => {
                                    console.log('modal closed ');
                                    close();
                                }}>
                                Confirm deletion
                            </button>
                            <button className="button" onClick={() => {
                                    console.log('modal closed ');
                                    close();
                                }}>
                                close modal
                            </button>
                        </div>
                    )}
                </Popup>
            </div>

        </Popup>
    )
}
