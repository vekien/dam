import React, { useState, useEffect } from 'react';
import Routing from './routing';
import Header from './header';

export default function DigitalAssetManager() {
    return (
        <div>
            <Header />
            <Routing />
        </div>
    )
}
