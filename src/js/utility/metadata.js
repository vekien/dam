import Storage from './storage';

class Metadata {
    constructor() {
        this.saveFolder = 'data';
        this.saveFilename = 'metadata.json';
        this.metadata = {};
        this.load();
    }

    /**
     * Add a new category
     */
    set(id, data) {
        this.metadata[id] = data;
        this.save();
        return this;
    }

    save() {
        Storage.save(this.saveFolder, this.saveFilename, JSON.stringify(this.metadata));
        return this;
    }

    get(id) {
        return this.metadata[id];
    }

    load() {
        // load our current category list
        this.metadata = Storage.load(this.saveFolder, this.saveFilename);
        this.metadata = this.metadata === null ? {} : JSON.parse(this.metadata);
        return this;
    }
}

export default new Metadata();
