import React, { useState, useEffect } from "react";
import FileList from "./FileList";
import Navbar from "../Navbar";
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

  const [files, setFiles] = useState(testFiles)

  useEffect(() => {
    setTimeout(() => {
      cd(null);
    }, 1000);
  }, [])

  function cd(folder) {
    const newFiles = [...files, {
      id: 13,
      name: 'lol',
      isFolder: true
    }];
    setFiles(newFiles);
  }

  function selectFile() {
    console.log("file selected");
  }

  return (
    <>
      <React.Suspense fallback={<FontAwesomeIcon icon='spinner' pulse />}>
        <Navbar />
      </React.Suspense>
      <div id='main'>
        <div id='fileContainer'>
        <FileList files={files} clickHandler={selectFile} />
        </div>
      </div>
    </>
  )
}
