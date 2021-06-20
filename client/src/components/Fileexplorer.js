import React, { useState, useEffect } from "react";
import { useToasts } from 'react-toast-notifications';

import Navbar from "../Navbar";
import Menubar from "./Menubar";
import FileList from "./FileList";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../pages/css/Fileexplorer.css';


export default function Fileexplorer() {
  // Hooks
  const { addToast } = useToasts();
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState('/home');

  var folderHistory = [];

  useEffect(() => {
    cd(null);
  }, []);


  function cd(folderid) {
    axios.post("http://localhost:80/storage", {folderid: folderid}).then(res => {
      var newFiles = res.data;
      setFiles(newFiles);
      folderHistory.push(folderid);
      setPath(folderid);
    }).catch(error => {
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  function navigateBack() {
    console.log('navigate up');
    var previousFolder = folderHistory.pop();
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
          <FileList files={files} cd={cd}/>
        </div>
      </div>
    </>
  )
}
