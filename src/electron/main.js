"use strict";


// This file will be executed in the main process (the Node.js environment). It
// constructs the UI portion of the application that will be displayed using
// Chromium (the renderer process).


const app = require("electron").app;
const BrowserWindow = require("electron").BrowserWindow;
const path = require("path");
const rendererEvents = require("./rendererEvents");


const _RENDERER_CONFIG_OUTPUT_FILE = "rendererConfig.json";


process.env.ELECTRON_HIDE_INTERNAL_MODULES = "true";


let window;
app
    .on("ready", () => {
        let query;
        try {
            query = require(`./${_RENDERER_CONFIG_OUTPUT_FILE}`);
        } catch (err) {
            console.log(`W-- URL params file: ${err.message || JSON.stringify(err)}`);
        }

        createMainWindow(query);
        rendererEvents.connect();
    })
    .on("window-all-closed", () => {
        app.quit();
    });


function createMainWindow(query) {
    const options = {
        autoHideMenuBar: true,
        fullscreenable: true,
        useContentSize: true,
        webPreferences: {
            textAreasAreResizable: true
        }
    };

    window = new BrowserWindow(options);
    window.on("closed", () => {
        window = null;
    });

    window.toggleDevTools();

    let queryString = "";
    const queryKeys = query ? Object.keys(query) : [];
    if (0 < queryKeys.length) {
        queryString = "?" + queryKeys
            .map(key => {
                return `${key}=${query[key]}`;
            })
            .join("&");
    }

    const url = `file://${path.join(__dirname, "index.html")}${queryString}`;
    console.log(`d-- loading URL: ${url}`);
    window.loadURL(url);
}
