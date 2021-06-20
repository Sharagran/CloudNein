import React, { useState, useEffect } from "react";
import { useToasts } from 'react-toast-notifications';

import Navbar from "../Navbar";
import Menubar from "./Menubar";
import FileList from "./FileList";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    </>
  )
}
