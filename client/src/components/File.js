import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import Popup from 'reactjs-popup';
import { useToasts } from 'react-toast-notifications';

// Defines which fileEndings get the specified icon
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

// Tags cache, required in the case of a user adding tags but not confirming it but closing the edit window instead
var cachedTags;

/**
 * Component for a File/Folder and all related functions
 * @param id fileID
 * @param name Display name of file/folder
 * @param isFolder boolean which indicates if the file is a folder
 * @param comment file comment
 * @param tags file tags
 * @param cd change directory function
 * @param getFolders getFolders function
 * @param moveFile moveFile function
 * @param areSharedFiles boolean which indicates if this is a shared file (true will limit file options)
 * @param shareDownload alternative download function for shared files to provide additional checks before downloading
 * @return render of File/Folder
 */
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

    // state
    const [fileProperties, setFileProperties] = useState({
        comment: comment,
        visible: true,
        tags: tags,
        downloads: null,
        maxDownloads: null
    });

    // only executed once
    useEffect(() => {
        setFileProperties({ ...fileProperties, tags: tags });
        cachedTags = tags;
        getFileStats();
    }, []);


    // Modal/popup window for the 'share' option
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

    // Modal/popup window for the '+' option when adding tags
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

    // Modal/popup window for the 'edit' option
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

    // Modal/popup window for the 'move' option
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
        buttons: [{
            label: 'Move', close: true, onClick: () => {
                moveFile(id, moveTarget.current.value)
            }
        }]
    }

    // Modal/popup window for the 'delete' option
    const delete_modal_props = {
        label: 'Delete',
        title: `Delete file`,
        content: 'Are you sure that you want to permanently delete this file?',
        buttons: [{ label: 'confirm', close: true, onClick: _delete }]
    }

    // Modal/popup window for the 'limit downloads' option
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

    /** 'Open' option click handler for opening Folders */
    function openClickHandler() {
        cd({ id: id, name: name });
    }

    /** Download File/Folder */
    function download() {
        axios({
            url: 'http://localhost:80/download/' + id,
            method: 'GET',
            responseType: 'blob',
        }).then(res => {
            // create download button with file url and click it after pressing the real download button
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            if (isFolder) {
                // set download attribute to folder/zip path
                link.setAttribute('download', `${name}.zip`);
            } else {
                // set download attribute to file path
                link.setAttribute('download', name);
            }
            document.body.appendChild(link);
            // trigger download and remove blob after
            link.click();
            link.remove();
        }).catch(error => {
            console.error(error.stack);
            addToast('Download attempt failed', { appearance: 'error' });
        });
    }

    /** Share File/Folder with entered values */
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

            // Inform user about successful sharing and offer to copy the share link to the clipboard
            addToast(<div>File shared: <span className='copy-to-clipboard' onClick={() => {
                copyToClipboard(shareLink);
                addToast('Share link copied to clipboard', { appearance: 'info' });
            }}>copy link</span></div>, { appearance: 'success' });

        }).catch(error => {
            console.error(error.stack);
            addToast('File share failed', { appearance: 'error' });
        });

    }

    /** add new Tag to the state/UI */
    function addTag() {
        var tag = tagRef.current.value;
        var tmpTags = fileProperties.tags;
        tmpTags.push(tag);

        var newFileProperties = { ...fileProperties, tags: tmpTags }
        setFileProperties(newFileProperties);
    }

    /** send edit (updated file properties) to the server */
    function edit() {
        const data = {
            tags: fileProperties.tags,
            comment: commentRef.current.value,
            fileID: id
        };

        axios.post("http://localhost:80/updateFileInformation", {
            fileInforamtion: data
        }).then(res => {
            var newFileProperties = { ...fileProperties, comment: data.comment, tags: data.tags };
            setFileProperties(newFileProperties);
            cachedTags = data.tags;

            addToast('File updated', { appearance: 'success' });
        }).catch(error => {
            console.error(error.stack);
            addToast('Failed updating file information', { appearance: 'error' });
        })

    }

    /** set max download limit of a File/Folder */
    function setMaxDownloads() {
        var maxDownloads = parseInt(maxDownloadsRef.current.value)
        const data = {
            fileID: id,
            maxDownloads: maxDownloads
        };

        axios.post("http://localhost:80/setMaxDownloads", data).then(res => {
            addToast('Download limit set', { appearance: 'success' });

            var newFileProperties = { ...fileProperties, maxDownloads: maxDownloads }
            setFileProperties(newFileProperties);
        }).catch(error => {
            console.error(error.stack);
            addToast('Failed setting download limit', { appearance: 'error' });
        });
    }

    /** Get file downlaods and max downloads from the server */
    function getFileStats() {
        axios.post("http://localhost:80/getFileStats", { fileID: id }).then(res => {
            var newFileProperties = { ...fileProperties, downloads: res.data.downloads, maxDownloads: res.data.maxDownloads }
            setFileProperties(newFileProperties);
        });

    }

    /** restore cached tags after user closes 'edit' window */
    function editModalClosed() {
        var newFileProperties = { ...fileProperties, tags: cachedTags };
        setFileProperties(newFileProperties);
    }

    /** delete this file/folder */
    function _delete() {
        var data = {
            fileID: id
        };

        axios.post('http://localhost:80/deleteFile', data).then(res => {
            addToast('File deleted', { appearance: 'success' });

            // make file/folder invisible after deletion
            var newFileProperties = { ...fileProperties, visible: false };
            setFileProperties(newFileProperties);
        }).catch(error => {
            console.error(error.stack);
            addToast('Failed deleting file', { appearance: 'error' });
        });
    }

    /** copies a string to the clipboard */
    function copyToClipboard(string) {
        navigator.clipboard.writeText(string);
    }

    //#region assign icon to the file/folder
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
    //#endregion

    /** File UI component with Icon and filename */
    const FileButton = React.forwardRef(({ open, ...props }, ref) => (
        <div className="file" ref={ref} {...props}>
            <span className="fileIcon"><FontAwesomeIcon icon={fileIcon} size="2x" /></span>
            <span className="fileName">{name}</span>
        </div>
    ));

    // Dont render invisible files
    if (fileProperties.visible == false) return null;

    return (
        // render File 
        <Popup
            trigger={<FileButton />}
            position="bottom"
            arrow={true}
            nested
        >
            {/* File menu for selected files (left-click) */}
            <div className="file-menu">
                {/* options to display for logged in user in the Storage menu */}
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
                {/* options to display for shared files */}
                {areSharedFiles && <div className="menu-item" onClick={() => { shareDownload(id, name) }}>Download</div>}
            </div>

        </Popup>
    )
}

/**
 * Modal/Popup-window wrapper
 * @param label label which opens the Modal/popup on click
 * @param title title of the Modal/popup
 * @param content content of the Modal/popup
 * @param buttons buttons at the bottom of the Modal/popup
 * @param args additional arguments for the Modal/popup
*/
function Modal({ label, title, content, buttons, ...args }) {
    return (
        //Modal button label
        <Popup
            trigger={<div className="menu-item">{label}</div>}
            closeOnDocumentClick={false}
            modal
            nested
            {...args}
        >
            {close => (
                // Render Modal popup
                <div className="modal-content">
                    <button className="close" onClick={close}>
                        &times;
                    </button>
                    <div className="header">{title}</div>
                    <div className="content">
                        {content}
                    </div>
                    {/* Render all passed in buttons */}
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

/**
 * slightly Modfied version of Modal without div around the Modal button label so that the add Tag buttton (+) can be displayed inline
 * @param label label which opens the Modal/popup on click
 * @param title title of the Modal/popup
 * @param content content of the Modal/popup
 * @param buttons buttons at the bottom of the Modal/popup
 * @param args additional arguments for the Modal/popup
*/
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
