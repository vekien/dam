import React, { useState, useEffect } from 'react';
import Cats from '../utility/categories';
import Config from '../utility/config';
import moment from "moment";

const {shell} = require('electron');

export default function CategoryManager(props) {
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [savePath, setSavePath] = useState('');
    const [deleteCategory, setDeleteCategory] = useState(false);

    /**
     * Save the new category
     */
    function handleNewCategory(event) {
        event.preventDefault();
        Cats.add(newCatName);
        setNewCatName('');
        props.updateCategories();
        document.getElementById('new-category-name').focus();
    }

    function confirmDelete(category) {
        // todo -- finish this
        alert("not yet implemented");
        setDeleteCategory(false);
    }

    function updateCategoryName(id, name) {
        Cats.rename(id, name);
        props.updateCategories();
    }

    function openCategoryFolder(category) {
        const folder = savePath + "\\" + category.id;
        shell.openItem(folder);
    }

    useEffect(() => {
        setCategories(Cats.get());
        setSavePath(Config.get('SAVE_PATH'));
    });

    return (
        <div>
            <h1>Manage Categories</h1>
            <p>
                Manage your list of categories.
            </p>

            <form onSubmit={handleNewCategory} className="form-categories">
                <h3>Create a new category</h3>
                <div className="form-row">
                    <label>Name</label>
                    <input id="new-category-name"
                           type="text"
                           value={newCatName}
                           onChange={event => setNewCatName(event.target.value)}
                           autoFocus
                    />
                </div>
                <div>
                    <button type="submit" className="btn-success">Create Category</button>
                </div>
            </form>

            <br/>

            {
                deleteCategory && <div>
                    <div className="modal-shade" onClick={() => { setDeleteCategory(false) }}></div>
                    <div className="cat-delete">
                        <h2>{deleteCategory.name}</h2>
                        <p>
                            Are you sure you want to delete this category?
                        </p>
                        <div className="error">
                            <strong>
                                All content within the folder {deleteCategory.folder} will be deleted.
                            </strong>
                        </div>
                        <br/>
                        <button className="btn-danger" onClick={() => { confirmDelete(deleteCategory) }}>Confirm Delete</button>
                    </div>
                </div>
            }

            <table>
                <thead>
                    <tr>
                        <th width="2%"></th>
                        <th width="55%">Name</th>
                        <th width="10%">Files</th>
                        <th>Created</th>
                        <th width="12%">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        !categories.length && <tr>
                            <td colSpan="5">
                                <strong>You have no categories</strong>
                            </td>
                        </tr>
                    }
                    {
                        categories.map((cat, i) => {
                            const createdTime = moment(cat.created).fromNow();

                            return (
                                <tr key={i}>
                                    <td className="tac">{i+1}</td>
                                    <td>
                                        <div className="form-row" style={{padding: 0}}>
                                            <input type="text" id="update-cat" defaultValue={cat.name} onChange={event => { updateCategoryName(cat.id, event.target.value) }}/>
                                        </div>
                                    </td>
                                    <td className="tac">{cat.fileCount}</td>
                                    <td className="tar">{createdTime}</td>
                                    <td className="tar">
                                        <button className="btn-primary" onClick={() => { openCategoryFolder(cat) }}>
                                            <i className="fad fa-folders"></i>
                                        </button>
                                        &nbsp;&nbsp;&nbsp;
                                        <button className="btn-danger" onClick={() => { setDeleteCategory(cat) }}>
                                            <i className="fad fa-dumpster"></i>
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}
