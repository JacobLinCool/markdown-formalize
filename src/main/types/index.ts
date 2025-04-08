export interface MarkdownOptions {
    customCss?: string;
    highlightTheme?: string;
    format?: "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "Legal";
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface PdfGeneratorOptions {
    width: number;
    height: number;
    headless: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    type: "link" | "image";
    resource: string;
    error: string;
}

export interface FormalizeResult {
    pdfBuffer: Buffer;
    validationResult: ValidationResult;
}
