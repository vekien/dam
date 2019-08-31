import React, { useState, useEffect } from 'react';
import Config from '../utility/config';

const {dialog} = require('electron').remote;

export default function Settings(props) {
    const [configSavePath, setConfigSavePath] = useState('');

    /**
     * Set the new save path
     */
    function setSavePath() {
        const path = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (typeof path === 'undefined' || path.length === 0) {
            return;
        }

        Config.set("SAVE_PATH", path[0]);
        setConfigSavePath(path[0]);
        props.updateCategories();
    }

    useEffect(() => {
        if (Config.get('SAVE_PATH')) {
            setConfigSavePath(Config.get('SAVE_PATH'));
        }
    });

    return (
        <div>
            <h1>Settings</h1>
            <p>
                Manage the apps settings.
            </p>

            <br/>

            {
                Config.hasSettings() === false && <div>
                    <div className="error">
                        Please configure the apps settings.
                    </div>
                    <br/>
                </div>
            }

            <div className="form">
                <div className="form-row">
                    <label>Asset Directory Save Path</label>
                    <input type="text"
                           className="clickable"
                           placeholder="Click to browse to folder"
                           onClick={setSavePath}
                           value={configSavePath}
                           readOnly={true}
                    />
                    <small>
                        This will be where all your assets are stored. Please choose a storage
                        space that has enough space for all your content.
                    </small>
                </div>
            </div>
        </div>
    )
}
