<script lang="ts">
    import { onMount } from "svelte";
    import FileDropZone from "./components/FileDropZone.svelte";
    import ValidationErrors from "./components/ValidationErrors.svelte";
    import FileItem from "./components/FileItem.svelte";

    type FileStatus = "processing" | "success" | "error";

    interface ProcessedFile {
        id: string;
        name: string;
        status: FileStatus;
        errors: { type: string; resource: string; error: string }[];
        pdfPath: string | null;
    }

    let processedFiles: ProcessedFile[] = [];
    let selectedErrors: { type: string; resource: string; error: string }[] = [];
    let theme = "dark"; // Default theme
    let isDrawerOpen = false; // Add drawer state variable

    // Handle file selection/drop
    function handleFiles(event: CustomEvent<{ files: File[] }>) {
        const { files } = event.detail;

        // Process each file
        files.forEach(async (file) => {
            const fileId = generateId();

            // Add file to the processed list
            processedFiles = [
                ...processedFiles,
                {
                    id: fileId,
                    name: file.name,
                    status: "processing",
                    errors: [],
                    pdfPath: null,
                },
            ];

            // Read the file
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target?.result as string;

                try {
                    // Send to main process for conversion
                    const filePath = window.api.webUtils.getPathForFile(file);
                    window.electron.ipcRenderer.send("convert-markdown", {
                        id: fileId,
                        content,
                        fileName: file.name,
                        filePath,
                    });
                } catch (error) {
                    updateFileStatus(fileId, "error", [], null);
                }
            };

            reader.readAsText(file);
        });
    }

    // Update file status when conversion is complete
    function updateFileStatus(
        id: string,
        status: FileStatus,
        errors: { type: string; resource: string; error: string }[] = [],
        pdfPath: string | null = null,
    ) {
        processedFiles = processedFiles.map((file) => {
            if (file.id === id) {
                return { ...file, status, errors, pdfPath };
            }
            return file;
        });
    }

    // Generate a unique ID for each file
    function generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    // Show errors in the side panel
    function showErrors(errors: { type: string; resource: string; error: string }[]) {
        selectedErrors = errors;
        if (errors.length > 0) {
            isDrawerOpen = true;
        }
    }

    onMount(() => {
        // Set initial theme
        document.documentElement.setAttribute("data-theme", theme);

        // Listen for conversion result from the main process
        window.electron.ipcRenderer.on(
            "conversion-result",
            // @ts-expect-error
            (result: {
                id: string;
                success: boolean;
                errors: { type: string; resource: string; error: string }[];
                pdfPath: string | null;
            }) => {
                const { id, success, errors, pdfPath } = result;
                const status = success && errors.length === 0 ? "success" : "error";

                updateFileStatus(id, status, errors, pdfPath);

                // Show errors if there are any
                if (errors.length > 0) {
                    selectedErrors = errors;
                }
            },
        );
    });
</script>

<div class="min-h-screen bg-base-100 drawer drawer-end {isDrawerOpen ? 'drawer-open' : ''}">
    <input id="drawer-right" type="checkbox" class="drawer-toggle" bind:checked={isDrawerOpen} />
    <div class="drawer-content">
        <main class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold mb-2">Markdown Formalize</h1>
                <p class="text-base opacity-70">
                    Convert Markdown to beautifully formatted PDF documents
                </p>
            </div>

            <FileDropZone on:files={handleFiles} />

            {#if processedFiles.length > 0}
                <div class="mt-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold">Files</h2>
                        <div class="badge badge-outline">
                            {processedFiles.length} file{processedFiles.length === 1 ? "" : "s"}
                        </div>
                    </div>
                    <div class="space-y-3">
                        {#each processedFiles as file}
                            <FileItem
                                fileName={file.name}
                                status={file.status}
                                errors={file.errors}
                                pdfPath={file.pdfPath}
                                {showErrors}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        </main>
    </div>

    <div class="drawer-side">
        <label for="drawer-right" aria-label="close sidebar" class="drawer-overlay"></label>
        <div class="p-4 w-80 min-h-full bg-base-200 text-base-content">
            <ValidationErrors errors={selectedErrors} onClose={() => (isDrawerOpen = false)} />
        </div>
    </div>
</div>
