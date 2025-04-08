import { ElectronAPI } from "@electron-toolkit/preload";
import type { WebUtils } from "electron";

declare global {
    interface Window {
        electron: ElectronAPI;
        api: {
            webUtils: WebUtils;
        };
    }
}
