import React from 'react'
import File from './File';


/**
 * Renders all files/folders of the passed in 'files' array
 * @param files array with files/folders that are supposed to be rendered
 * @param cd change directory function
 * @param getFolders getFolders function
 * @param moveFile moveFile function
 * @param areSharedFiles boolean which indicates if this is a shared file (true will limit file options)
 * @param shareDownload alternative download function for shared files to provide additional checks before downloading
 * @return render of all files/folders
 */
export default function FileList({ files, cd , getFolders, moveFile, areSharedFiles, shareDownload}) {
    return (
        // Render all files included in the files array
        files.map(file => {
            return <File key={file.id} id={file.id} name={file.name} isFolder={file.isFolder}
            comment={file.comment} tags={file.tags} cd={cd} getFolders={getFolders}
            moveFile={moveFile} areSharedFiles={areSharedFiles} shareDownload={shareDownload} />
        })
    )
}
