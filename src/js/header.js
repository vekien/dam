import React, { useState, useEffect } from 'react';
import AppWin from './app/app-win';

export default function Header() {
    const [appWinInit, setAppWinInit] = useState(false);

    useEffect(() => {
        // init app window
        if (appWinInit === false) {
            AppWin.init();
            setAppWinInit(true);
        }
    });

    return (
        <div className="header">
            <div>
                Asset Manager
            </div>
            <div>
                <button type="button" id="Launcher.Window.Min"><i className="fal fa-minus"></i></button>
                <button type="button" id="Launcher.Window.Max"><i className="far fa-square"></i></button>
                <button type="button" id="Launcher.Window.Close"><i className="fal fa-times"></i></button>
            </div>
        </div>
    )
}
