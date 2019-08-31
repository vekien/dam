import React from 'react';

export default function Tools() {

    function toolCompressImages() {
        let folder = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (typeof folder === 'undefined' || folder.length === 0) {
            return;
        }

        // get folder
        folder = folder[0];

    }

    return (
        <div>
            <h1>Tools</h1>


            <h3>Image Compression</h3>
            <p>
                Select the folder of images you'd like to compress, the action
                is performed as soon as you choose a folder.
            </p>
            <div>
                <div className="form-row">
                    <label>Folder</label>
                    <input type="text"
                           className="clickable"
                           placeholder="Select folder to compress all images within"
                           onClick={toolCompressImages}
                           value=""
                           readOnly={true}
                    />
                </div>
            </div>
        </div>
    )
}
