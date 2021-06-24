import React, { useState, useEffect, useRef } from "react";
import { useToasts } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Popup from 'reactjs-popup';

import Navbar from "../components/Navbar";
import Menubar from "../components/Menubar";
import FileList from "../components/FileList";
import axios from 'axios';
import './css/Fileexplorer.css';

// folderHistory used for navigating back up
var folderHistory;
// Data of the home directory folder
const home = { id: null, name: '/home' };

export default function Fileexplorer() {
  // Hooks
  const { addToast } = useToasts();
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState('');
  const foldernameRef = useRef();

  // only executed once
  useEffect(() => {
    folderHistory = [];
    cd(home);
  }, []);


  /**
   * Change directory
   * @param folder folder object to navigate in
  */
  function cd(folder) {
    axios.post("http://localhost:80/storage", { folderid: folder.id }).then(res => {
      // show contents of new directory
      var newFiles = res.data;
      setFiles(newFiles);

      // add new directory to folderHistory
      folderHistory.push(folder);
      // update path
      var p = '';
      folderHistory.forEach(folder => {
        p += folder.name + '/';
      });
      setPath(p);

    }).catch(error => {
      console.error(error.stack);
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  /**
   * Create a folder
   * @param name name of the new folder
  */
  function createFolder(name) {
    var currentFolder = folderHistory.slice(-1); //last element in array
    if (currentFolder === null) currentFolder = home;

    axios.post("http://localhost:80/createFolder", { parentID: currentFolder.id, folderName: name }).then(res => {
      addToast('Folder created', { appearance: 'success' });
       // reload folder contents by navigating in the same folder again
      folderHistory.pop(); // prevent the same folder to appear twice in folderHistory
      cd(currentFolder);
    }).catch(error => {
      console.error(error.stack);
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  /**
   * @returns all folders inside the files state
  */
  function getFolders() {
    var folder = files.filter(f => f.isFolder)
    return folder
  }

  /**
   * Moves a file inside a folder
   * @param fileID id of the file that is supposed to be moved
   * @param folderID id of the folder which the file is supposed to be moved in
  */
  function moveFile(fileID, folderID) {

    if (folderID === null) {
      folderID = folderHistory.slice(-2).id;
    }

    axios.post("http://localhost:80/moveFolder", { folderID: folderID, fileID: fileID }).then(res => {
      addToast('File/Folder moved', { appearance: 'success' });
      //reload folder
      var currentFolder = folderHistory.pop();
      cd(currentFolder);
    }).catch(error => {
      console.error(error.stack);
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  /** Navigate back/one directory up */
  function navigateBack() {
    //current folder
    folderHistory.pop();
    var previousFolder = folderHistory.pop();

    // no previous Folder
    if (!previousFolder) previousFolder = home;

    cd(previousFolder);
  }

  return (
    <>
    {/* left Navigation bar */}
      <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
        <Navbar />
      </React.Suspense>
      <div id='main'>
        {/* top Menubar */}
        <Menubar path={path} navigateBack={navigateBack} />
        {/* Render files/folders */}
        <div id='fileContainer'>
          <FileList files={files} cd={cd} getFolders={getFolders} moveFile={moveFile} />
        </div>
      </div>
      {/* Context/right-click menu */}
      <MyContextMenu createFolder={createFolder} foldernameRef={foldernameRef} />
    </>
  )
}

//#region Context/right-click Menu
function MyContextMenu({ createFolder, foldernameRef }) {
  return <>
    <ContextMenuTrigger ref={c => contextTrigger = c} id="fileexplorer-context-menu">
    </ContextMenuTrigger>
    <ContextMenu id="fileexplorer-context-menu" className='fileexplorer-context-menu'>
      <MenuItem attributes={{ className: 'create-folder' }} >
        <Popup trigger={<div>Create Folder</div>} modal closeOnDocumentClick={false}>
          {close => (
            <div className="modal-content">
              <button className="close" onClick={close}>
                &times;
              </button>
              <div className="header">Create Folder</div>
              <div className="content">
                <div className='label-container'>
                  <label htmlFor='folder'>Folder name:</label>
                  <input id='folder' type="text" ref={foldernameRef} placeholder='Folder name' />
                </div>
              </div>
              <button className="button" onClick={() => {
                var folderName = foldernameRef.current.value;
                createFolder(folderName);
                close();
              }}>
                Create Folder
              </button>
            </div>
          )}
        </Popup>
      </MenuItem>
    </ContextMenu>
  </>
}

var contextTrigger = null;
/** Toggle Context/right-click Menu */
function toggleMenu(e) {
  if (contextTrigger) {
    contextTrigger.handleContextClick(e);
  }
}
// Add context menu listener
if (document.addEventListener) {
  document.addEventListener('contextmenu', function (e) {
    toggleMenu(e);
    e.preventDefault();
  }, false);
} else {
  document.attachEvent('oncontextmenu', function (e) {
    toggleMenu(e);
    window.event.returnValue = false;
  });
}
//#endregion
