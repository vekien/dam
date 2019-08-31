import React, { useState, useEffect } from 'react';
import Storage from '../utility/storage';
import Metadata from '../utility/metadata';
import Cats from '../utility/categories';

const {dialog, nativeImage} = require('electron').remote;
const Buffer = require('buffer').Buffer;
const uuidv4 = require('uuid/v4');
const panzoom = require('panzoom');

export default function Viewer(props) {
    const [trigger, setTrigger] = useState(1);
    const [category, setCategory] = useState(false);
    const [multi, setMulti] = useState([]);

    const [uiShowContentUploader, setUiShowContentUploader] = useState(false);
    const [uiAddContentStatus, setUiAddContentStatus] = useState('');
    const [uiShowContent, setUiShowContent] = useState(false);
    const [uiShowContentMetadata, setUiShowContentMetadata] = useState(false);
    const [uiImageData, setUiImageData] = useState(false);
    const [uiMultiSelect, setUiMultiSelect] = useState(false);
    const [uiMultiSelectShow, setUiMultiSelectShow] = useState(false);

    useEffect(() => {
        // Load Category
        if (category === false || category.id !== props.match.params.category) {
            loadCategory(props.match.params.category);
            reset();
        }
    });

    function escapeKeyPress() {
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                reset();
            }
        };
    }

    /**
     * Reset the view
     */
    function reset() {
        setUiShowContentUploader(false);
        setUiAddContentStatus(false);
        setUiShowContent(false);
        setUiShowContentMetadata(false);
        setUiImageData(false);
        setUiMultiSelect(false);
        setUiMultiSelectShow(false);
        setMulti([])
    }

    /**
     * Show images
     */
    function showContent(image) {
        setUiShowContent(image);
        setUiShowContentMetadata(Metadata.get(image.filename));

        setTimeout(() => {
            panzoom(document.querySelector('#file-panzoom'), {
                smoothScroll: false
            });
        }, 100);
    }

    /**
     * Load the category, sets the folder + empty content arr
     */
    function loadCategory(id) {
        const cat = Cats.get(id);

        if (cat === null) {
            return;
        }

        setCategory(cat);

        // load the content for this category
        loadCategoryContent(cat);
    }

    /**
     * This will load all content for this category
     */
    function loadCategoryContent(category) {
        // read all files in directory
        const results = Storage.readDirectory(category.folder);

        // no directory exists
        if (results === null) {
            return;
        }

        // print files
        category.content = [];
        results.map((file, i) => {
            let filename = file.replace(/^.*[\\\/]/, '');

            // grab file extension
            let ext = filename.split('.');
            ext = ext[ext.length - 1];

            category.content.push({
                // replace to fix weird issues on windows with a ? in path name...
                // todo - investigate issue ^
                filename_path: `${category.folder}\\${file}`.replace(new RegExp("\\\\", 'g'), "/"),
                filename_thumb: `${category.folder}\\thumbs\\${file}`.replace(new RegExp("\\\\", 'g'), "/").replace(`.${ext}`, '.jpg'),
                filename: filename,
                ext: ext,
                type: 'image',
            });
        });

        // set file count
        category.fileCount = category.content.length;

        // save category and update side
        Cats.update(category).save();
        props.updateCategories();

        // set category
        setCategory(category);
    }

    /**
     * Handle file select, does the "upload" logic.
     */
    function handleFileSelect() {
        const files = dialog.showOpenDialog({
            properties: ['multiSelections'],
            title: "Choose which assets you'd like to add",
            filters: [
                { name: 'Supported Media', extensions: [
                    'jpg', 'png', 'gif',
                    'mkv', 'avi', 'mp4',
                    'mp3', 'wav', 'ogg',
                    'txt', 'csv'
                ] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (typeof files === 'undefined' || files.length === 0) {
            return;
        }

        // ensure category folder exists
        Storage.makeFolder(category.folder);
        Storage.makeFolder(category.folder + '\\thumbs');
        handleFileCopy(files);
    }

    /**
     * Handle a file upload
     */
    function handleFileCopy(files) {
        const total = files.length;

        // we're done, no more files!
        if (total === 0) {
            // load all our new images
            loadCategoryContent(category);

            // hide uploader
            setUiShowContentUploader(false);
            setUiAddContentStatus(false);
            return;
        }

        const file = files.pop();

        // show remaining
        setUiAddContentStatus(`Remaining: ${total} files: ${file}`);

        // handle recursive copy
        handleFileCopyRecursive(file, () => {
            handleFileCopy(files);
        });
    }

    /**
     * Handle recursive file copy
     */
    function handleFileCopyRecursive(file, callback) {
        let filename = file.replace(/^.*[\\\/]/, '').toLowerCase();

        // grab file extension
        let ext = filename.split('.');
        ext = ext[ext.length - 1];

        // create new random filename
        let newFilename = `${uuidv4()}.${ext}`;
        let filepath = `${category.folder}\\${newFilename}`;
        let thumbpath = `${category.folder}\\thumbs\\${newFilename}`.replace(`.${ext}`, '.jpg');

        // if it's an image
        if (['jpg','jpeg','png'].indexOf(ext) > -1) {
            // create thumbnail
            let image = nativeImage.createFromPath(file);
            image = image.resize({ width: 320, height: 160, quality: 'good' });
            image = image.toJPEG(70);

            // save a thumbnail
            Storage.saveBuffer(thumbpath, image, () => {
                // move main file
                Storage.moveFile(file, filepath, () => {
                    // get image data
                    Storage.getImageData(filepath, info => {
                        // set metadata
                        Metadata.set(
                            newFilename,
                            {
                                type: 'image',
                                original: filename,
                                filename: newFilename,
                                filepath: filepath,
                                thumbpath: thumbpath,
                                extension: ext,
                                info: info,
                            }
                        );

                        callback();
                    });
                });
            });

            return;
        }

        if (['mkv','avi','mp4'].indexOf(ext) > -1) {
            Storage.getVideoImage(file, 10, (base64) => {
                // save thumbnail
                thumbpath = thumbpath.replace(`.${ext}`, '.jpg');

                Storage.saveBase64(thumbpath, base64, () => {
                    // resize thumbnail
                    let image = nativeImage.createFromPath(thumbpath);
                    image = image.resize({ width: 320, height: 160, quality: 'good' });
                    image = image.toJPEG(70);

                    Storage.saveBuffer(thumbpath, image, () => {
                        // move file
                        Storage.moveFile(file, filepath, callback);

                        // meta
                        Metadata.set(
                            newFilename,
                            {
                                type: 'video',
                                original: filename,
                                filename: newFilename,
                                filepath: filepath,
                                thumbpath: thumbpath,
                                extension: ext,
                            }
                        );
                    });
                });
            });


        }

        if (['mp3','wav','ogg'].indexOf(ext) > -1) {
            Storage.moveFile(file, filepath, callback);

            Metadata.set(
                newFilename,
                {
                    type: 'sound',
                    original: filename,
                    filename: newFilename,
                    filepath: filepath,
                    thumbpath: thumbpath,
                    extension: ext,
                }
            );
        }

        if (['txt','csv'].indexOf(ext) > -1) {
            Storage.moveFile(file, filepath, callback);

            Metadata.set(
                newFilename,
                {
                    type: 'document',
                    original: filename,
                    filename: newFilename,
                    filepath: filepath,
                    thumbpath: thumbpath,
                    extension: ext,
                }
            );
        }
    }

    /**
     * Enable multi-select
     */
    function enableMultiSelect() {
        setUiMultiSelect(!uiMultiSelect);

        // if it's true, we'll be switching to off in the state
        if (uiMultiSelect === true) {
            setMulti([]);

            // todo - find a better way to do this, it forces re-render
            setTrigger(Date.now());
        }
    }

    /**
     * Open multi select
     */
    function openMultiSelect() {
        setUiMultiSelectShow(multi);

        setTimeout(() => {
            panzoom(document.querySelector('#file-multi-grid'), {
                smoothScroll: false
            }).zoomAbs(50, 50, 0.5);
        }, 100);
    }

    /**
     * Delete currently viewed image
     */
    function deleteContent() {
        // delete
        Storage.deleteFile(uiShowContent.filename_path);
        Storage.deleteFile(uiShowContent.filename_thumb);

        setTimeout(() => {
            // reload the category
            reset();
            loadCategoryContent(category);
        }, 500);
    }

    escapeKeyPress();

    return (
        <div>
            <div className="cat-header">
                <div>
                    {
                        category && <div>
                            <h1>
                                Category: <strong>{category.name}</strong> ({category.fileCount})
                                <small className="clickable" onClick={() => { Storage.openFolder(category.folder) }}>{category.folder}</small>
                            </h1>
                        </div>
                    }
                    {
                        !category && <div>
                            <div className="error">Cannot find information for this category.</div>
                        </div>
                    }
                </div>
                <div>
                    {
                        category && <div>
                            <button type="button"
                                    className="cat-add-content"
                                    onClick={() => { setUiShowContentUploader(true) }}
                            >
                                <i className="fad fa-upload"></i> Add content
                            </button>
                        </div>
                    }
                </div>
            </div>

            <div className="cat-actions">
                {
                    category && <span>
                        <button typeof="button" className={uiMultiSelect ? 'btn btn-primary' : 'btn'} onClick={enableMultiSelect}>Multi-Select</button>
                    </span>
                }

                {
                    multi.length > 0 && <span>
                        &nbsp;&nbsp;&nbsp;
                        <button typeof="button" className="btn btn-primary" onClick={openMultiSelect}>Open Selected ({multi.length})</button>
                    </span>
                }
            </div>

            {
                uiShowContentUploader && <div>
                    <div className="modal-shade"></div>
                    <div className="cat-uploader">
                        <h3>Upload content to: {category.name}</h3>
                        <div className="cat-status">{uiAddContentStatus}</div>
                        <div className="cat-form">
                            <div className="form-row">
                                <label>Select a file</label>
                                <input type="text"
                                       className="clickable"
                                       placeholder="Click to browse files"
                                       onClick={handleFileSelect}
                                       value=""
                                       readOnly={true}
                                />
                            </div>
                        </div>
                        <strong>
                            Files will be COPIED from their selected location.
                        </strong>
                        <br/>
                        <small>
                            Press [ESC] key to close.
                        </small>
                    </div>
                </div>
            }
            {
                uiShowContent && <div>
                    <div className="modal-shade"></div>
                    <div className="file-viewer">
                        <div>
                            <div>
                                <h3>INFORMATION</h3>
                                <div className="file-viewer-info">
                                    <strong>{uiShowContentMetadata.original}</strong>
                                    <br/><br/>
                                    Type: <span>{uiShowContentMetadata.type}</span><br/>
                                    {
                                        uiShowContentMetadata.info && <div>
                                            Format: <span>{uiShowContentMetadata.info.format}</span><br/>
                                            Res: <span>{uiShowContentMetadata.info.height} x {uiShowContentMetadata.info.width}</span>
                                        </div>
                                    }
                                </div>

                                <hr/>

                                <h3>TAGS</h3>
                                <p>Add a tag</p>

                                <hr/>

                                <div className="file-viewer-bottom">
                                    <button type="button" className="btn-danger" onClick={deleteContent}>Delete</button>
                                </div>

                            </div>
                        </div>
                        <div>
                            <div id="file-panzoom">
                                {
                                    uiShowContentMetadata.type === 'image' && <div>
                                        <img alt={uiShowContentMetadata.original}
                                             src={uiShowContent.filename_path}
                                        />
                                    </div>
                                }
                                {
                                    uiShowContentMetadata.type === 'video' && <div className="file-viewer-video">
                                        <video src={uiShowContent.filename_path} controls></video>
                                    </div>
                                }
                                {
                                    uiShowContentMetadata.type === 'sound' && <div className="file-viewer-sound">
                                        <audio src={uiShowContent.filename_path} controls></audio>
                                    </div>
                                }
                                {
                                    uiShowContentMetadata.type === 'document' && <div className="file-viewer-sound">
                                        A document
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
            {
                uiMultiSelectShow && <div>
                    <div className="modal-shade"></div>
                    <div className="file-multi">
                        <div className="file-multi-grid" id="file-multi-grid">
                        {
                            multi.map((item, index) => {
                                const meta = Metadata.get(item.filename);

                                let output = '';

                                console.log(meta);

                                if (meta.type === 'video') {
                                    output = <video src={item.filename_path} controls></video>
                                }

                                if (meta.type === 'sound') {
                                    output = <audio src={item.filename_path} controls></audio>
                                }

                                if (meta.type === 'item') {
                                    output = <div>
                                        Document: {meta.original}
                                    </div>
                                }

                                if (meta.type === 'image') {
                                    output = <img alt={meta.original} src={item.filename_path} />
                                }

                                return (
                                    <div key={index} className="file-multi-grid-item">
                                        {output}
                                    </div>
                                );
                            })
                        }
                        </div>
                    </div>
                </div>
            }

            <div className="cat-images">
                {
                    category && category.content.map((item, index) => {
                        // metadata
                        const meta = Metadata.get(item.filename);

                        // if multi-selected or not
                        const isSelected = typeof multi.find(o => o.filename === item.filename) != 'undefined';

                        // on click handle for multi-select
                        const func = () => {
                            // add to multi-select
                            if (uiMultiSelect && isSelected === false) {
                                multi.push(item);

                                // add multi-select
                                setMulti(multi);

                                // todo - find a better way to do this, it forces re-render
                                setTrigger(Date.now());
                                return;
                            }

                            // remove from multi-select
                            if (uiMultiSelect && isSelected === true) {
                                multi.splice(multi.indexOf(item), 1);

                                // add multi-select
                                setMulti(multi);

                                // todo - find a better way to do this, it forces re-render
                                setTrigger(Date.now());
                                return;
                            }

                            showContent(item);
                        };


                        if (meta && meta.type === 'sound') {
                            item.filename_thumb = 'sound_thumbnail.png';
                        }

                        if (meta && meta.type === 'document') {
                            item.filename_thumb = 'document_thumbnail.png';
                        }

                        // set styles
                        const styles = {
                            backgroundImage: `url(${item.filename_thumb})`
                        };

                        return (
                            <span key={index} style={styles} className={isSelected ? 'selected' : ''} onClick={func}>
                                <span className="cat-original">{meta.original}</span>

                                {
                                    isSelected && <div key={index} className="multi-select">
                                        <i className="fas fa-check"></i>
                                    </div>
                                }
                            </span>
                        )
                    })
                }
            </div>
        </div>
    )
}
