import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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

export default function File({ id, name, isFolder, comment, tags, cd, getFolders, moveFile, areSharedFiles, shareDownload }) {
    // Hooks
    const { addToast } = useToasts();
    const commentRef = useRef();
    const emailRef = useRef();
    const expiresRef = useRef();
    const usagesRef = useRef();
    const tagRef = useRef();
    const moveTarget = useRef();
    const maxDownloadsRef = useRef();

    const [fileProperties, setFileProperties] = useState({
        comment: comment,
        visible: true,
        tags: tags,
        downloads: null,
        maxDownloads: null
    });

    useEffect(() => {
        setFileProperties({...fileProperties, tags: tags});
        cachedTags = tags;
        getFileStats();
    }, []);

    

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
                    <input type="number" id='expires' ref={expiresRef} placeholder="Days" min="1" max="30" required></input>
                </div>
                <div className='label-container'>
                    <label htmlFor='usages'>Usages:</label>
                    <input type="number" id='usages' ref={usagesRef} placeholder="Usages" min="1" required></input>
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
                    return <li key={tag}>
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

    const move_modal_props = {
        label: 'Move',
        title: `Add Tag to ${name}`,
        content: <>
        <div className='label-container'>
            <label htmlFor='comment'>Folder:</label>
            <select id="folder" ref={moveTarget}>
            <option value="null">Move up</option>
                {getFolders().map(folder => {
                    return (<option key={folder.id} value={folder.id}>{folder.name}</option>)
                })}
            </select>
        </div>
        </>,
        buttons: [{ label: 'Move', close: true, onClick: () => { 
            moveFile(id, moveTarget.current.value)
        }}]
    }

    const delete_modal_props = {
        label: 'Delete',
        title: `Delete file`,
        content: 'Are you sure that you want to permanently delete this file?',
        buttons: [{ label: 'confirm', close: true, onClick: _delete }]
    }

    const set_maxDownloads_props = {
        label: 'Limit Downloads',
        title: `Set Download limit`,
        content: <>
        <div className='label-container'>
            <p>Current Downloads: {fileProperties.downloads}</p>
            <p>Max Downloads: {fileProperties.maxDownloads}</p>
            <label htmlFor='maxDownloads'>Download limit:</label>
            <input id='maxDownloads' type="text" ref={maxDownloadsRef} placeholder='max downloads' />
        </div>
        </>,
        buttons: [{ label: 'Set', close: true, onClick: setMaxDownloads }]
    }

    function openClickHandler() {
        cd({id: id, name: name});
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
            console.error(error.stack);
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
            console.error(error.stack);
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
            console.error(error.stack);
            addToast('Failed updating file information', { appearance: 'error' });
        })

    }

    function setMaxDownloads() {
        var maxDownloads = parseInt(maxDownloadsRef.current.value)
        const data = {
            fileID: id,
            maxDownloads: maxDownloads
        };

        axios.post("http://localhost:80/setMaxDownloads", data).then(res => {
            addToast('Download limit set', { appearance: 'success' });

            var newFileProperties = {...fileProperties, maxDownloads: maxDownloads}
            setFileProperties(newFileProperties);
        }).catch(error => {
            console.error(error.stack);
            addToast('Failed setting download limit', { appearance: 'error' });
        });
    }

    function getFileStats() {
        axios.post("http://localhost:80/getFileStats", {fileID: id}).then(res => {
            var newFileProperties = {...fileProperties, downloads: res.data.downloads, maxDownloads: res.data.maxDownloads}
            setFileProperties(newFileProperties);
        });
        
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
            console.error(error.stack);
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
            arrow={true}
            nested
        >

            <div className="file-menu">
                {/* Storage file options */}
                {isFolder && <div className="menu-item" onClick={openClickHandler}>Open</div>}
                {!areSharedFiles &&
                <>
                <div className="menu-item" onClick={download}>Download</div>
                <Modal {...share_modal_props} title={`Share ${name}`} />
                <Modal {...set_maxDownloads_props} />
                <Modal {...edit_modal_props} title={`Edit ${name}`} />
                <Modal {...move_modal_props} title={`move ${name}`} />
                <Modal {...delete_modal_props} title={`Delete ${name}`} />
                </>
                }
                {/* Share link file options */}
                {areSharedFiles && <div className="menu-item" onClick={() => {shareDownload(id, name)}}>Download</div>}
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
                        return <button key={uuidv4()} className="button" onClick={() => {
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
                        return <button key={uuidv4()} className="button" onClick={() => {
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
