import { HashRouter as Router, Route, NavLink, Redirect } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Home from "./pages/home";
import Settings from "./pages/settings";
import Categories from "./pages/categories";
import Viewer from "./pages/viewer";
import Cats from './utility/categories';
import Config from "./utility/config";

export default function Routing() {
    const [categories, setCategories] = useState([]);

    /**
     * re-loads the category lists and gets them
     */
    function updateCategories() {
        setCategories(Cats.load().get());
    }

    useEffect(() => {
        setCategories(Cats.get());
    });

    return (
        <div className="site">
            <Router>
                <nav>
                    <NavLink to="/" className="nav-link">
                        <i className="fad fa-home"></i> Home
                    </NavLink>
                    <NavLink to="/categories" className="nav-link">
                        <i className="fad fa-layer-group"></i> Categories
                    </NavLink>
                    <NavLink to="/settings" className="nav-link">
                        <i className="fad fa-sliders-v"></i> Settings
                    </NavLink>
                    <hr/>
                    <div className="cat-list">
                        {
                            categories.map((cat, i) => {
                                const url = "/category/" + cat.id;

                                return (
                                    <NavLink key={i} to={url} activeClassName="nav-link-active">
                                        <i className="fal fa-hashtag"></i> {cat.name}
                                        <span className="cat-label">{cat.fileCount}</span>
                                    </NavLink>
                                )
                            })
                        }
                    </div>

                    {
                        Config.hasSettings() === false && <Redirect
                            to={{
                                pathname: "/settings",
                            }}
                        />
                    }
                </nav>
                <main>
                    <Route exact path="/" component={Home} />
                    <Route exact
                           path="/settings"
                           render={
                               (props) => <Settings {...props} updateCategories={updateCategories} />
                           }
                    />
                    <Route exact
                           path="/categories"
                           render={
                               (props) => <Categories {...props} updateCategories={updateCategories} />
                           }
                    />
                    <Route exact
                           path="/category/:category"
                           render={
                               (props) => <Viewer {...props} updateCategories={updateCategories} />
                           }
                    />
                </main>
            </Router>
        </div>
    );
}
