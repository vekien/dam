import Storage from './storage';

class Metadata {
    constructor() {
        this.saveFolder = 'data';
        this.saveFilename = 'metadata.json';
        this.data = {};
        this.load();
    }

    /**
     * Add a new category
     */
    set(id, data) {
        this.data[id] = data;
        this.save();
        return this;
    }

    save() {
        Storage.save(this.saveFolder, this.saveFilename, JSON.stringify(this.data));
        return this;
    }

    get(id) {
        return this.data[id];
    }

    load() {
        // load our current category list
        this.data = Storage.load(this.saveFolder, this.saveFilename);
        this.data = this.data === null ? {} : JSON.parse(this.data);
        return this;
    }
}

export default new Metadata();
