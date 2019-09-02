import Storage from './storage';

class Tags {
    constructor() {
        this.saveFolder = 'data';
        this.saveFilename = 'tags.json';
        this.data = {};
        this.load();
    }

    /**
     * Add a new category
     */
    add(tag, filename) {
        if (typeof this.data[tag] === 'undefined') {
            this.data[tag] = [];
        }

        if (this.data[tag].indexOf(filename) > -1) {
            return;
        }

        this.data[tag].push(filename);
        this.save();
        return this;
    }

    remove(tag, filename) {
        const index = this.data[tag].indexOf(filename);

        if (index > -1) {
            delete this.data[tag][index];
            this.save();
        }

        return this;
    }

    save() {
        Storage.save(this.saveFolder, this.saveFilename, JSON.stringify(this.data));
        return this;
    }

    get(tag) {
        return this.data[tag];
    }

    find(filename) {
        const tags = [];

        for (let tag in this.data) {
            if (this.data[tag].indexOf(filename) > -1) {
                tags.push(tag);
            }
        }

        console.log(tags, filename);

        return tags;
    }

    load() {
        // load our current category list
        this.data = Storage.load(this.saveFolder, this.saveFilename);
        this.data = this.data === null ? {} : JSON.parse(this.data);
        return this;
    }
}

export default new Tags();
