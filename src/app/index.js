"use strict";


const actions = require("./action/actions");
const ipc = require("../electron/renderer/ipc");
const React = require("react");
const ReactContent = require("./view/ReactContent.jsx");
const ReactDOM = require("react-dom");
const reducers = require("./reducer/reducers");
const redux = require("redux");
const reduxThunk = require("redux-thunk").default;
const url = require("url");


const _query = url.parse(window.location.href, true).query;
const _startupDelayMs = _query["appStartupDelay"] ? _query["appStartupDelay"] : 0;


setTimeout(() => {
    ipc.log("index.js - started.", "iii");

    const thunk = redux.applyMiddleware(reduxThunk);
    const store = redux.createStore(reducers, thunk);

    // Loading language information early is a good idea.
    store.dispatch(actions.localeChanged(_query["current-locale"]));

    // Use the query to configure the application after updateLocale resolves.

    const content = React.createElement(ReactContent, { store });
    ReactDOM.render(content, document.getElementById("react-content"));
}, _startupDelayMs);
