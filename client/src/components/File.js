import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

import Popup from 'reactjs-popup';
import { useToasts } from 'react-toast-notifications';

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

var cachedTags;

export default function File({ id, name, isFolder, comment, tags, cd }) {
    const [fileProperties, setFileProperties] = useState({
        comment: comment,
        visible: true
    });

    useEffect(() => {
        setFileProperties({...fileProperties, tags: tags});
        cachedTags = tags;
    }, []);

    const { addToast } = useToasts();
    const commentRef = useRef();
    const emailRef = useRef();
    const expiresRef = useRef();
    const usagesRef = useRef();
    const tagRef = useRef();

    const share_modal_props = {
        label: 'Share',
        title: 'Share file',
        content: <>
            <form onSubmit={share}>
                <div className='label-container'>
                    <label htmlFor='email'>Email:</label>
                    <input type="email" id='email' ref={emailRef} placeholder="Email" required></input>
                </div>
                <div className='label-container'>
                    <label htmlFor='expires'>Expires:</label>
                    <input type="number" id='expires' ref={expiresRef} placeholder="Days" min="1" max="30"></input>
                </div>
                <div className='label-container'>
                    <label htmlFor='usages'>Usages:</label>
                    <input type="number" id='usages' ref={usagesRef} placeholder="Usages" min="1"></input>
                </div>
                <button type='submit'>Share</button>
            </form>
        </>
    }

    const addTag_modal_props = {
        label: '+',
        title: `Add Tag to ${name}`,
        content: <>
        <div className='label-container'>
            <label htmlFor='comment'>Tag:</label>
            <input id='comment' type="text" ref={tagRef} placeholder='Tag' />
        </div>
        </>,
        buttons: [{ label: 'Add', close: true, onClick: addTag }]
    }

    const edit_modal_props = {
        label: 'Edit',
        title: 'Share file',
        content: <>
            <div className='label-container'>
                <label htmlFor='comment'>Comment:</label>
                <input id='comment' type="text" ref={commentRef} placeholder='Comment' defaultValue={fileProperties.comment} />
            </div>
            <label>Tags:</label>
            <ul className='tag-list'>
                {fileProperties.tags ? fileProperties.tags.map(tag => {
                    return <li>
                        <Link to="#">{tag}</Link>
                    </li>
                }) : 'test'
                }
                <li><AddTagModal {...addTag_modal_props} /></li>
            </ul>
        </>,
        buttons: [{ label: 'Confirm', close: true, onClick: edit }],
        onOpen: () => { cachedTags = [...fileProperties.tags]; }, //copy array (non-reference copy)
        onClose: editModalClosed
    }

    const delete_modal_props = {
        label: 'Delete',
        title: `Delete file`,
        content: 'Are you sure that you want to permanently delete this file?',
        buttons: [{ label: 'confirm', close: true, onClick: _delete }]
    }

    function download() {
        axios({
            url: 'http://localhost:80/download/' + id,
            method: 'GET',
            responseType: 'blob',
        }).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            if (isFolder) {
                link.setAttribute('download', `${name}.zip`);
            } else {
                link.setAttribute('download', name);
            }
            document.body.appendChild(link);
            link.click();
            link.remove();
        }).catch(error => {
            console.error(error);
            addToast('Download attempt failed', { appearance: 'error' });
        });
    }

    function share(e) {
        e.preventDefault();

        const data = {
            email: emailRef.current.value,
            days: expiresRef.current.value,
            fileID: id,
            usages: usagesRef.current.value
        }

        axios.post("http://localhost:80/share", {
            shareInformation: data
        }).then(res => {
            var shareID = res.data.shareID;
            var shareLink = `${window.location.origin}/sharefile?shareID=${shareID}`;

            addToast(<div>File shared: <span className='copy-to-clipboard' onClick={() => {
                copyToClipboard(shareLink);
                addToast('Share link copied to clipboard', { appearance: 'info' });
            }}>copy link</span></div>, { appearance: 'success' });

        }).catch(error => {
            console.error(error);
            addToast('File share failed', { appearance: 'error' });
        });

    }

    function addTag() {
        var tag = tagRef.current.value;
        var tmpTags = fileProperties.tags;
        tmpTags.push(tag);
        
        var newFileProperties = {...fileProperties, tags: tmpTags}
        setFileProperties(newFileProperties);
    }

    function edit() {
        const data = {
            tags: fileProperties.tags,
            comment: commentRef.current.value,
            fileID: id
        };

        axios.post("http://localhost:80/updateFileInformation", {
            fileInforamtion: data
        }).then(res => {
            var newFileProperties = {...fileProperties, comment: data.comment, tags: data.tags};
            setFileProperties(newFileProperties);
            cachedTags = data.tags;

            addToast('File updated', { appearance: 'success' });
        }).catch(error => {
            console.error(error);
            addToast('Failed updating file information', { appearance: 'error' });
        })

    }

    function editModalClosed() {
        var newFileProperties = {...fileProperties, tags: cachedTags};
        setFileProperties(newFileProperties);
    }


    function _delete() {
        var data = {
            fileID: id
        };

        axios.post('http://localhost:80/deleteFile', data).then(res => {
            addToast('File deleted', { appearance: 'success' });

            var newFileProperties = {...fileProperties, visible: false};
            setFileProperties(newFileProperties);
        }).catch(error => {
            console.error(error);
            addToast('Failed deleting file', { appearance: 'error' });
        });
    }

    function copyToClipboard(string) {
        navigator.clipboard.writeText(string);
    }

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


    if(fileProperties.visible == false) return null;

    return (
        <Popup
            trigger={<FileButton />}
            position="bottom"
            // contentStyle={{ padding: '0px', border: 'none' }}
            arrow={true}
            nested
        >

            <div className="file-menu">
                <div className="menu-item" onClick={() => { cd(id); }}>{isFolder ? 'Open' : 'View'}</div>
                <div className="menu-item" onClick={download}>Download</div>
                <Modal {...share_modal_props} title={`Share ${name}`} />
                <Modal {...edit_modal_props} title={`Edit ${name}`} />
                <Modal {...delete_modal_props} title={`Delete ${name}`} />
            </div>

        </Popup>
    )
}


function Modal({ label, title, content, buttons, ...args }) {
    return (
        <Popup
            trigger={<div className="menu-item">{label}</div>}
            closeOnDocumentClick={false}
            modal
            nested
            {...args}
        >
            {close => (
                <div className="modal-content">
                    <button className="close" onClick={close}>
                        &times;
                    </button>
                    <div className="header">{title}</div>
                    <div className="content">
                        {content}
                    </div>
                    {buttons && buttons.map(button => {
                        return <button className="button" onClick={() => {
                            button.onClick();
                            if (button.close) {
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

function AddTagModal({ label, title, content, buttons }) {
    return (
        <Popup
            trigger={<a href="javascript:void(0)">{label}</a>}
            closeOnDocumentClick={false}
            modal
            nested
        >
            {close => (
                <div className="modal-content">
                    <button className="close" onClick={close}>
                        &times;
                    </button>
                    <div className="header">{title}</div>
                    <div className="content">
                        {content}
                    </div>
                    {buttons && buttons.map(button => {
                        return <button className="button" onClick={() => {
                            button.onClick();
                            if (button.close) {
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
