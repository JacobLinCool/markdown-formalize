export const createHtmlTemplate = (
    content: string,
    highlightTheme: string,
    customCss: string = "",
): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="http://localhost:48450/node_modules/@fontsource-variable/noto-sans-tc/index.css">
    <link rel="stylesheet" href="http://localhost:48450/node_modules/highlight.js/styles/${highlightTheme}.min.css">
    <style>
        body {
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            padding: 2rem;
        }
        pre {
            padding: 16px;
            overflow: auto;
            border-radius: 3px;
            background-color: #f5f5f5;
        }
        code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 14px;
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .page-number {
            position: fixed;
            bottom: 10px;
            right: 10px;
            font-size: 12px;
        }
        .page-number:before {
            content: counter(page);
        }
        @page {
            counter-increment: page;
            @bottom-right {
                content: counter(page);
            }
        }
        ${customCss}
    </style>
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
                processEscapes: true
            },
            svg: { fontCache: 'global' }
        };
    </script>
    <script src="http://localhost:48450/node_modules/mathjax/es5/tex-mml-svg.js"></script>
    <script src="http://localhost:48450/node_modules/mermaid/dist/mermaid.min.js"></script>
</head>
<body>
    ${content}
</body>
</html>
`;
