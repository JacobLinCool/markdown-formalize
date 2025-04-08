import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import debug from "debug";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import express from "express";
import { readFileSync, writeFileSync } from "node:fs";
import type { Server } from "node:http";
import path from "node:path";
import icon from "../../resources/icon.png?asset";
import { formalizeMarkdown } from "./markdown";
import type { FormalizeResult } from "./types";

debug.enable("markdown-formalize:*");

const log = debug("markdown-formalize:electron");
const error = debug("markdown-formalize:electron:error");

export async function formalizMarkdownFile(filePath: string): Promise<FormalizeResult> {
    const content = readFileSync(filePath, "utf-8");
    return await formalizeMarkdown(content, {}, filePath);
}

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: path.join(__dirname, "../preload/index.js"),
            sandbox: false,
        },
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }

    // Set up IPC handlers for file conversion
    setupIpcHandlers();
}

function setupIpcHandlers(): void {
    // Convert Markdown to PDF
    ipcMain.on("convert-markdown", async (event, payload) => {
        const { id, content, fileName, filePath } = payload;
        log("Received convert-markdown request for file: %s", fileName);
        log("File path: %s", filePath || "unknown");

        try {
            // Create default output path
            const outputDir = filePath ? path.dirname(filePath) : app.getPath("documents");
            const baseName = path.basename(fileName, path.extname(fileName));
            const outputPath = path.join(outputDir, `${baseName}.pdf`);

            // Formalize the markdown
            const result = await formalizeMarkdown(content, {}, filePath);

            // Write PDF to file
            writeFileSync(outputPath, result.pdfBuffer);
            log("PDF written to %s", outputPath);

            // Send result back to renderer
            event.reply("conversion-result", {
                id,
                success: true,
                errors: result.validationResult.errors,
                pdfPath: outputPath,
            });
        } catch (err) {
            error("Error converting markdown: %s", err);
            event.reply("conversion-result", {
                id,
                success: false,
                errors: [{ type: "system", resource: fileName, error: String(err) }],
                pdfPath: null,
            });
        }
    });

    // Open PDF file
    ipcMain.on("open-pdf", (_, pdfPath) => {
        log("Opening PDF: %s", pdfPath);
        shell.openPath(pdfPath).catch((err) => {
            error("Failed to open PDF: %s", err);
        });
    });

    // Show file in folder
    ipcMain.on("show-in-folder", (_, filePath) => {
        log("Showing in folder: %s", filePath);
        shell.showItemInFolder(filePath);
    });
}

// start express server for serving node_modules static files
const STATIC_SERVER_PORT = 48450;
const expressApp = express();
const serveDir = path.join(__dirname, "../../node_modules");
log("Serving node_modules from %s", serveDir);
expressApp.use("/node_modules", express.static(serveDir));
const server = new Promise<Server>((resolve) => {
    const s = expressApp.listen(STATIC_SERVER_PORT, () => {
        log("Static server running on http://localhost:%d", STATIC_SERVER_PORT);
        resolve(s);
    });
});

process.on("exit", () => {
    log("Exiting...");
    server.then((s) => {
        s.close(() => {
            log("Static server closed");
        });
    });
});

async function main(): Promise<void> {
    log("Process arguments:", process.argv);
    const mdfiles = process.argv.filter((arg) => arg.endsWith(".md") || arg.endsWith(".markdown"));

    await app.whenReady();

    electronApp.setAppUserModelId("com.markdown-formalize");

    if (mdfiles.length > 0) {
        log("CLI mode");
        for (const filePath of mdfiles) {
            try {
                const { pdfBuffer } = await formalizMarkdownFile(filePath);
                const outputFile = filePath.replace(/\.(md|markdown)$/, ".pdf");
                writeFileSync(outputFile, pdfBuffer);
                log("PDF generated: %s", outputFile);
                process.exit(0);
            } catch (err) {
                error("Error converting file:", err);
                process.exit(1);
            }
        }
    } else {
        // GUI mode
        log("GUI mode");

        // Default open or close DevTools by F12 in development
        // and ignore CommandOrControl + R in production.
        // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
        app.on("browser-window-created", (_, window) => {
            optimizer.watchWindowShortcuts(window);
        });
        createWindow();
    }
}

main();
