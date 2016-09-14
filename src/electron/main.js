"use strict";


// This file will be executed in the main process (the Node.js environment). It
// constructs the UI portion of the application that will be displayed using
// Chromium (the renderer process).


const app = require("electron").app;
const BrowserWindow = require("electron").BrowserWindow;
const path = require("path");
const rendererEvents = require("./rendererEvents");


const _MAIN_CONFIG_OUTPUT_FILE = "mainConfig.json";
const _RENDER_CONFIG_OUTPUT_FILE = "renderConfig.json";


process.env.ELECTRON_HIDE_INTERNAL_MODULES = "true";


const _args = {};
process.argv.forEach(arg => {
    if (arg[0] !== "-" || arg.startsWith("--")) {
        return;
    }

    const equalsIndex = arg.indexOf("=");
    if (1 < equalsIndex) {
        _args[arg.substring(1, equalsIndex)] = arg.substring(equalsIndex + 1);
    } else if (equalsIndex < 0) {
        _args[arg.substring(1)] = undefined;
    }
});


let window;
app
    .on("ready", () => {
        let mainConfig;
        try {
            mainConfig = require(`./${_MAIN_CONFIG_OUTPUT_FILE}`);
        } catch (err) {
            console.log(`W-- main config file: ${err.message || JSON.stringify(err)}`);
        }

        let renderConfig;
        try {
            renderConfig = require(`./${_RENDER_CONFIG_OUTPUT_FILE}`);
        } catch (err) {
            console.log(`W-- render config file: ${err.message || JSON.stringify(err)}`);
        }

        createMainWindow(mainConfig, renderConfig);
        rendererEvents.connect();
    })
    .on("window-all-closed", () => {
        app.quit();
    });


function createMainWindow(mainConfig = {}, renderConfig = {}) {
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

    if (_args.hasOwnProperty("dev-tools")) {
        let showDevTools = true;
        if (mainConfig.hasOwnProperty("devTools") && !mainConfig.devTools) {
            showDevTools = false;
        }

        if (showDevTools) {
            window.toggleDevTools();
        }
    }

    let query = "";
    const rconfigKeys = Object.keys(renderConfig);
    if (0 < rconfigKeys.length) {
        query = "?" + rconfigKeys
            .map(key => {
                return `${key}=${renderConfig[key]}`;
            })
            .join("&");
    }

    const url = `file://${path.join(__dirname, "index.html")}${query}`;
    console.log(`d-- loading URL: ${url}`);
    window.loadURL(url);
}
