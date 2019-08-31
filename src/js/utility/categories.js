import Storage from './storage';
import Config from "./config";

const uuidv4 = require('uuid/v4');

class Categories {
    constructor() {
        this.saveFolder = 'cats';
        this.saveFilename = 'list.json';
        this.load();
    }

    /**
     * Add a new category
     * @param name
     */
    add(name) {
        const cat = {
            id: uuidv4(),
            name: name,
            fileCount: 0,
            created: Date.now(),
        };

        this.categories.unshift(cat);
        this.save();
        return this;
    }

    update(category) {
        this.categories.map((cat, i) => {
            if (cat.id === category.id) {
                this.categories[i] = category;
            }
        });

        return this;
    }

    save() {
        Storage.save(this.saveFolder, this.saveFilename, JSON.stringify(this.categories));
        return this;
    }

    get(id) {
        if (id) {
            const cat = this.categories.find(o => o.id === id);

            if (typeof cat === 'undefined' || cat === null) {
                return null;
            }

            cat.folder = Config.get('SAVE_PATH') + '\\' + cat.id;
            cat.content = [];

            return cat;
        }

        return this.categories;
    }

    load() {
        // load our current category list
        this.categories = Storage.load(this.saveFolder, this.saveFilename);
        this.categories = this.categories === null ? [] : JSON.parse(this.categories);
        return this;
    }
}

export default new Categories();
