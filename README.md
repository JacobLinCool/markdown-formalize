# Markdown Formalize

<div align="center">

![Markdown Formalize](build/icon.png)

**Convert Markdown documents to beautifully formatted PDF files with ease**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/jacoblincool/markdown-formalize?color=brightgreen&label=version)](https://github.com/jacoblincool/markdown-formalize/releases/latest)

[Installation](#installation) •
[Features](#features) •
[Contributing](#contributing) •
[License](#license)

</div>

## Overview

Markdown Formalize is an elegant desktop application that transforms your Markdown documents into professionally formatted PDF files while preserving all formatting, code blocks, mathematical expressions, and diagrams. Perfect for creating documentation, academic papers, reports, and more.

## Features

- ✨ **Intuitive Interface**: Simple drag-and-drop functionality for processing Markdown files
- 🎨 **Syntax Highlighting**: Beautiful code syntax highlighting across numerous languages
- ➗ **Math Expressions**: Full LaTeX math formula support via MathJax integration
- 📊 **Diagram Support**: Built-in Mermaid diagram rendering capabilities
- 🖼️ **Smart Image Handling**: Automatically embeds both local and remote images
- 🔗 **Link Validation**: Detects and reports broken links in your documents
- 🌐 **Multilingual Support**: Proper rendering for multiple languages and writing systems
- ⌨️ **CLI Support**: Process files directly from the command line for automation workflows

## Installation

### Download Prebuilt Binaries

Download the latest version from the [Releases page](https://github.com/jacoblincool/markdown-formalize/releases).

> **Note for macOS Users:** If you encounter security warnings or "app is damaged" messages, run the following command in Terminal to remove the quarantine attribute:
>
> ```bash
> xattr -dr com.apple.quarantine /Applications/markdown-formalize.app
> ```
>
> See [this article](https://disable-gatekeeper.github.io/) for more information.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/jacoblincool/markdown-formalize.git
cd markdown-formalize

# Install dependencies
pnpm install

# Build the application
pnpm build:mac # For macOS
pnpm build:win # For Windows
pnpm build:linux # For Linux

# The packaged application will be in the dist/ directory
```

## Usage

### GUI Mode

1. Launch the Markdown Formalize application
2. Drag and drop your Markdown files onto the application window
3. The app will process your files and generate PDFs in the same directory
4. You can open the PDF or show it in the file explorer directly from the app

### Command Line Usage

```bash
# Process a single file
markdown-formalize path/to/your/file.md

# Process multiple files
markdown-formalize file1.md file2.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
