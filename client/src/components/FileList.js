import React from 'react'
import File from './File';


export default function FileList({ files, clickHandler }) {
    return (
        files.map(file => {
            return <File key={file.id} name={file.name} isFolder={file.isFolder} clickHandler={clickHandler} />
        })
    )
}
