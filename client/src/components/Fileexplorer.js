import React, { useState, useEffect } from "react";
import { useToasts } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import Navbar from "../Navbar";
import Menubar from "./Menubar";
import FileList from "./FileList";
import axios from 'axios';
import '../pages/css/Fileexplorer.css';

var folderHistory;
const home = {id: null, name: '/home'};

export default function Fileexplorer() {
  // Hooks
  const { addToast } = useToasts();
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState('');

  useEffect(() => {
    folderHistory = [];
    cd(home);
  }, []);

  function cd(folder) {
    axios.post("http://localhost:80/storage", {folderid: folder.id}).then(res => {
      var newFiles = res.data;
      setFiles(newFiles);

      folderHistory.push(folder);
      var p = '';
      folderHistory.forEach(folder => {
        p += folder.name + '/';
      });
      setPath(p);

    }).catch(error => {
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  function createFolder() {
    console.log('createFolder');
  }

  function navigateBack() {
    //current folder
    folderHistory.pop();
    var previousFolder = folderHistory.pop();

    // no previous Folder
    if(!previousFolder) previousFolder = home;

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
          <FileList files={files} cd={cd} />
        </div>
      </div>

      <ContextMenuTrigger ref={c => contextTrigger = c} id="fileexplorer-context-menu">
      </ContextMenuTrigger>
      <ContextMenu id="fileexplorer-context-menu" className='fileexplorer-context-menu'>
        <MenuItem onClick={createFolder} attributes={{className: 'create-folder'}} >
          Create Folder
        </MenuItem>
      </ContextMenu>
    </>
  )
}

var contextTrigger = null;

function toggleMenu(e) {
  if(contextTrigger) {
      contextTrigger.handleContextClick(e);
  }
}
// Add context menu listener
if (document.addEventListener) {
  document.addEventListener('contextmenu', function(e) {
    toggleMenu(e);
    e.preventDefault();
  }, false);
} else {
  document.attachEvent('oncontextmenu', function() {
    toggleMenu(e);
    window.event.returnValue = false;
  });
}
