import debug from "debug";
import { BrowserWindow } from "electron";
import hljs from "highlight.js";
import { Marked, type Token } from "marked";
import { markedHighlight } from "marked-highlight";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHtmlTemplate } from "../templates/default";
import { FormalizeResult, MarkdownOptions, ValidationError, ValidationResult } from "../types";

const log = debug("markdown-formalize:formalizer");

export class MarkdownFormalizer {
    private basePath: string = process.cwd();
    private marked: Marked;
    private options: Required<MarkdownOptions>;

    constructor(options: MarkdownOptions) {
        this.options = {
            highlightTheme: "github",
            format: "A4",
            margin: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 },
            customCss: "",
            ...options,
        };

        this.marked = new Marked(
            markedHighlight({
                emptyLangClass: "hljs",
                langPrefix: "hljs language-",
                highlight(code, lang) {
                    const language = hljs.getLanguage(lang) ? lang : "plaintext";
                    return hljs.highlight(code, { language }).value;
                },
            }),
        );

        this.marked.setOptions({ gfm: true, breaks: true });
        const renderer = new this.marked.Renderer();

        renderer.image = ({ href, title, text }): string => {
            if (href && !href.startsWith("http") && !href.startsWith("data:")) {
                try {
                    const imagePath = resolve(this.basePath, href);
                    console.log("Image path resolved: %s", imagePath);
                    href = `file://${imagePath}`;
                } catch (error) {
                    log("Failed to load image: %s", href, error);
                }
            }
            return `<img src="${href}"${title ? ` title="${title}"` : ""}${text ? ` alt="${text}"` : ""}>`;
        };

        this.marked.setOptions({ renderer });
    }

    setBasePath(path: string): this {
        this.basePath = dirname(path);
        return this;
    }

    private async validateLink(url: string): Promise<boolean> {
        try {
            if (url.startsWith("http")) {
                const response = await fetch(url, { method: "HEAD" });
                return response.ok;
            }
            return true; // Allow relative/anchor links
        } catch {
            return false;
        }
    }

    private async validateImage(src: string): Promise<boolean> {
        try {
            if (src.startsWith("http")) {
                const response = await fetch(src, { method: "HEAD" });
                return response.ok;
            } else if (src.startsWith("data:")) {
                return true;
            } else {
                const path = resolve(this.basePath, src);
                return existsSync(path);
            }
        } catch {
            return false;
        }
    }

    private async validate(markdown: string): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const tokens = this.marked.lexer(markdown, { gfm: true, breaks: true });

        const processTokens = async (tokenList: Token[]): Promise<void> => {
            for (const token of tokenList) {
                log("Processing token type: %s", token.type);

                if (token.type === "link") {
                    const valid = await this.validateLink(token.href);
                    if (!valid) {
                        errors.push({
                            type: "link",
                            resource: token.href,
                            error: "Link is not accessible",
                        });
                    }
                }

                if (token.type === "image") {
                    const valid = await this.validateImage(token.href);
                    if (!valid) {
                        errors.push({
                            type: "image",
                            resource: token.href,
                            error: "Image is not accessible",
                        });
                    }
                }

                // Recursively process nested tokens
                if ("tokens" in token && token.tokens) {
                    await processTokens(token.tokens);
                }

                // Handle items in lists
                if ("items" in token && Array.isArray(token.items)) {
                    for (const item of token.items) {
                        if (item.tokens && Array.isArray(item.tokens)) {
                            await processTokens(item.tokens);
                        }
                    }
                }
            }
        };

        await processTokens(tokens);

        if (errors.length > 0) {
            log("Validation errors found:", errors);
        } else {
            log("No validation errors found");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    private async renderContent(markdown: string): Promise<string> {
        const content = await this.marked.parse(markdown);
        const html = createHtmlTemplate(
            content,
            this.options.highlightTheme!,
            this.options.customCss,
        );
        return html;
    }

    async formalize(markdown: string): Promise<FormalizeResult> {
        const result = await this.validate(markdown);

        const html = await this.renderContent(markdown);
        log("HTML generated");

        const win = new BrowserWindow({
            width: 1280,
            height: 800,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        log("Window created");

        try {
            const tempFilePath = resolve(this.basePath, `.temp-${Date.now()}.html`);
            writeFileSync(tempFilePath, html);
            log("HTML written to temporary file:", tempFilePath);

            await win.loadURL(`file://${tempFilePath}`);
            log("Window loaded");

            await win.webContents.executeJavaScript(`
                new Promise(resolve => {
                    if (typeof MathJax !== "undefined") {
                        MathJax.typesetPromise().then(resolve);
                    } else {
                        resolve();
                    }
                })
            `);
            log("MathJax typeset");

            await win.webContents.executeJavaScript(`
                mermaid.initialize({startOnLoad: false});
                mermaid.run({querySelector: '.language-mermaid'});
            `);
            log("Mermaid rendered");

            const data = await win.webContents.printToPDF({
                pageSize: this.options.format,
                margins: this.options.margin,
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: "<div></div>",
                footerTemplate:
                    '<div style="font-size: 10px; text-align: right; width: 100%; margin: 0 1cm"><span class="pageNumber"></span></div>',
            });
            log("PDF generated");

            rmSync(tempFilePath, { force: true });
            log("Temporary file removed");

            return {
                pdfBuffer: data,
                validationResult: result,
            };
        } finally {
            win.close();
        }
    }
}

export const formalizeMarkdown = async (
    markdown: string,
    options: MarkdownOptions = {},
    filePath?: string,
): Promise<FormalizeResult> => {
    const formalizer = new MarkdownFormalizer(options);
    if (filePath) {
        formalizer.setBasePath(filePath);
    }
    return formalizer.formalize(markdown);
};
