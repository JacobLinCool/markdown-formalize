/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer, webUtils } from "electron";

// Custom APIs for renderer
const api = {
    webUtils,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", {
            ...electronAPI,
            ipcRenderer: {
                send: (channel: string, data: any) => {
                    // Whitelist channels we allow to send messages on
                    const validChannels = ["convert-markdown", "open-pdf", "show-in-folder"];
                    if (validChannels.includes(channel)) {
                        ipcRenderer.send(channel, data);
                    }
                },
                on: (channel: string, callback: (...args: any[]) => void) => {
                    // Whitelist channels we allow to receive messages on
                    const validChannels = ["conversion-result"];
                    if (validChannels.includes(channel)) {
                        // Deliberately strip event as it includes `sender`
                        const subscription = (_event: any, ...args: any[]) => callback(...args);
                        ipcRenderer.on(channel, subscription);

                        // Return a function to remove the listener
                        return () => {
                            ipcRenderer.removeListener(channel, subscription);
                        };
                    }

                    return undefined;
                },
            },
        });
        contextBridge.exposeInMainWorld("api", api);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-expect-error (define in dts)
    window.electron = {
        ...electronAPI,
        ipcRenderer: {
            ...ipcRenderer,
            on: (channel: string, callback: (...args: any[]) => void) => {
                const subscription = (_event: any, ...args: any[]) => callback(...args);
                ipcRenderer.on(channel, subscription);
                return () => {
                    ipcRenderer.removeListener(channel, subscription);
                };
            },
        },
    };
    // @ts-expect-error (define in dts)
    window.api = api;
}
