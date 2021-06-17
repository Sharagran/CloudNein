import React, { useState, useEffect } from "react";
import { useToasts } from 'react-toast-notifications';

import Navbar from "../Navbar";
import Menubar from "./Menubar";
import FileList from "./FileList";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../pages/css/Fileexplorer.css';

const testFiles = [
  {
    id: 1,
    name: 'image.png',
    isFolder: false
  },
  {
    id: 2,
    name: 'audio.webm',
    isFolder: false
  },
  {
    id: 3,
    name: 'textfile.txt',
    isFolder: false
  },
  {
    id: 4,
    name: 'ExtremelylongfoldernameExtremelylongfoldernameExtremelylongfoldernameExtremelylongfoldernameExtremelylongfoldername',
    isFolder: true
  },
  {
    id: 5,
    name: 'image.png',
    isFolder: false
  },
  {
    id: 6,
    name: 'audio.webm',
    isFolder: false
  },
  {
    id: 7,
    name: 'textfile.txt',
    isFolder: false
  },
  {
    id: 8,
    name: 'folder',
    isFolder: true
  },
  {
    id: 9,
    name: 'image.png',
    isFolder: false
  },
  {
    id: 10,
    name: 'audio.webm',
    isFolder: false
  },
  {
    id: 11,
    name: 'textfile.txt',
    isFolder: false
  },
  {
    id: 12,
    name: 'folder',
    isFolder: true
  },
]

export default function Fileexplorer() {
  // Hooks
  const { addToast } = useToasts();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    cd(null);
  }, [])

  // useEffect(() => {

  // }, files);


  function cd(folderid) {
    // setFiles(testFiles);

    axios.post("http://localhost:80/storage", {folderid: folderid}).then(res => {
      var newFiles = res.data;
      setFiles(newFiles);
    }).catch(error => {
      addToast(error.toString(), { appearance: 'error' });
    });
  }

  return (
    <>
      <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
        <Navbar />
      </React.Suspense>
      <div id='main'>
        <Menubar path="/home/" />
        <div id='fileContainer'>
          <FileList files={files} cd={cd}/>
        </div>
      </div>
    </>
  )
}
