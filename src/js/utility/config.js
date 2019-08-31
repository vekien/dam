const fs  = require("fs");
const app = require('electron').remote.app;

/**
 * Handles app and user config
 */
class Config {
    constructor() {
        this.directory = app.getPath('userData') + '/data/';
        this.filename  = 'config.json';
        this.config  = {
            SAVE_PATH: null,
        };

        this.loadSettings();
    }

    /**
     * Ensure we have some valid settings
     */
    hasSettings() {
        return this.config.SAVE_PATH !== null;
    }

    /**
     * Get single config
     */
    get(option) {
        return (typeof this.config[option] === 'undefined')
            ? console.error("There is no config field for: " + option)
            : this.config[option];
    }

    /**
     * Get the entire config
     */
    getConfig() {
        return this.config;
    }

    /**
     * Set a new config, this will also save it
     */
    set(option, value) {
        if (typeof this.config[option] === 'undefined') {
            console.error("There is no config field for: " + option);
            return;
        }

        this.config[option] = value;
        this.saveSettings();
    }

    /**
     * Load the apps config
     */
    loadSettings() {
        // create directory if it does not exist
        if (!fs.existsSync(this.directory)){
            fs.mkdirSync(this.directory);
        }

        // if file does not exist, create it
        if (!fs.existsSync(`${this.directory}${this.filename}`)) {
            this.saveSettings();
        }

        // read config and parse them
        this.config = JSON.parse(
            fs.readFileSync(`${this.directory}${this.filename}`, 'utf8')
        );
    }

    /**
     * Save the apps config
     */
    saveSettings() {
        const json = JSON.stringify(this.config);
        fs.writeFileSync(`${this.directory}${this.filename}`, json, "utf-8");
    }
}

export default new Config();
