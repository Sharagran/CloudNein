import React from 'react'
import File from './File';


export default function FileList({ files, cd }) {
    return (
        files.map(file => {
            return <File key={file.id} id={file.id} name={file.name} isFolder={file.isFolder} comment={file.comment} tags={file.tags} cd={cd} />
        })
    )
}
