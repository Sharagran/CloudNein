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

const share_modal_props = {
    label:'Share',
    title:'Share file',
    buttons:[{label: 'test', close:true, onClick: () => {console.log("click");}}]
}

const edit_modal_props = {
    label:'Edit',
    title:'Share file',
    content: <>
    <input type="text" placeholder='comment' /> <br />
    <label>Tags:</label>
    <ul className='tag-list'>
        <li><a href="">ExtremlyLongTag ExtremlyLongTag ExtremlyLongTag</a></li>
        <li><a href="">Tag 2</a></li>
        <li><a href="">Tag 3</a></li>
        <li><a href="">+</a></li>
    </ul>
    </>,
    buttons:[{label: 'Confirm', close:true, onClick: () => {console.log("click");}}]
}

const delete_modal_props = {
    label: 'Delete',
    title: `Delete file`,
    content: 'Are you sure that you want to permanently delete this file?',
    buttons: [{label: 'confirm', onClick: () => {console.log("click")}}]
}

export default function File({ name, isFolder, comment, tags }) {
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
        <div className="file" ref={ref} {...props}>
            <span className="fileIcon"><FontAwesomeIcon icon={fileIcon} size="2x" /></span>
            <span className="fileName">{name}</span>
        </div>
    ));

    return (
        <Popup
            trigger={<FileButton />}
            position="bottom"
            // contentStyle={{ padding: '0px', border: 'none' }}
            arrow={true}
            nested
        >

            <div className="file-menu">
                <div className="menu-item">Download</div>
                <Modal {...share_modal_props} title={`Share ${name}`} />
                <Modal {...edit_modal_props} title={`Edit ${name}`} comment={comment} tags={tags} />
                <Modal {...delete_modal_props} title={`Delete ${name}`} />
            </div>

        </Popup>
    )
}


 function Modal({ label, title, content, buttons, ...rest}) {
    return (
        <Popup trigger={<div className="menu-item">{label}</div>} modal nested>
                    {close => (
                        <div className=".modal-content">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="header">{title}</div>
                            <div className="content">
                                {content}
                            </div>
                            {buttons.map(button => {
                                return <button className="button" onClick={() => {
                                    button.onClick();
                                    if(button.close) {
                                        close();
                                    }
                                }}>
                                    {button.label}
                                </button>
                            })}
                        </div>
                    )}
                </Popup>
    )
}
