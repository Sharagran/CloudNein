import React, { useState, useEffect, useRef } from "react";
import { useToasts } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Popup from 'reactjs-popup';

import Navbar from "../Navbar";
import Menubar from "./Menubar";
import FileList from "./FileList";
import axios from 'axios';
import '../pages/css/Fileexplorer.css';

var folderHistory;
const home = { id: null, name: '/home' };

export default function Fileexplorer() {
  // Hooks
  const { addToast } = useToasts();
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState('');
  const foldernameRef = useRef();

  useEffect(() => {
    folderHistory = [];
    cd(home);
  }, []);



  function cd(folder) {
    axios.post("http://localhost:80/storage", { folderid: folder.id }).then(res => {
      var newFiles = res.data;
      setFiles(newFiles);

      folderHistory.push(folder);
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

  function createFolder(name) {
    var currentFolder = folderHistory.slice(-1); //last element in array
    if(currentFolder === null) currentFolder = home;

    axios.post("http://localhost:80/createFolder", {parentID: currentFolder.id, folderName: name}).then(res => {
      addToast('Folder created', { appearance: 'success' });
      folderHistory.pop();
      cd(currentFolder);
    }).catch(error => {
      console.error(error.stack);
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  function getFolders() {

    var folder = files.filter(f => f.isFolder)
    return folder
}

  function moveFile(fileID, folderID) {

    if(folderID === null){
      folerID = folderHistory.slice(-2).id;
    }
    console.log(fileID, " ", folderID);

    axios.post("http://localhost:80/moveFolder", { folderID: folderID, fileID: fileID}).then(res => {
      addToast('File/Folder moved', { appearance: 'success' });
      //reload folder
      var currentFolder = folderHistory.pop();
      cd(currentFolder);
    }).catch(error => {
      console.error(error.stack);
      addToast(error.toString(), { appearance: 'error' });
    });
  }

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
      <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
        <Navbar />
      </React.Suspense>
      <div id='main'>
        <Menubar path={path} navigateBack={navigateBack} />
        <div id='fileContainer'>
          <FileList files={files} cd={cd} getFolders={getFolders} moveFile={moveFile} />
        </div>
      </div>

      <MyContextMenu createFolder={createFolder} foldernameRef={foldernameRef} />
    </>
  )
}

function MyContextMenu({createFolder, foldernameRef}) {
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
  document.attachEvent('oncontextmenu', function () {
    toggleMenu(e);
    window.event.returnValue = false;
  });
}
