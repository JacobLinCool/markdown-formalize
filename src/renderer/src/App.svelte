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

    // Show validation errors when a file is clicked
    function showErrors(errors: { type: string; resource: string; error: string }[]) {
        selectedErrors = errors;
    }

    // Generate a unique ID for each file
    function generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    onMount(() => {
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

<main>
    <div class="container">
        <h1>Markdown Formalize</h1>
        <p class="subtitle">Convert Markdown to beautifully formatted PDF documents</p>

        <FileDropZone on:files={handleFiles} />

        {#if processedFiles.length > 0}
            <div class="files-list">
                <h2>Files</h2>
                {#each processedFiles as file}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div on:click={() => showErrors(file.errors)}>
                        <FileItem
                            fileName={file.name}
                            status={file.status}
                            errors={file.errors}
                            pdfPath={file.pdfPath}
                        />
                    </div>
                {/each}
            </div>
        {/if}

        <ValidationErrors errors={selectedErrors} />
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        min-height: 100vh;
        padding: 40px 20px;
    }

    .container {
        max-width: 800px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 10px;
        text-align: center;
    }

    .subtitle {
        font-size: 16px;
        color: var(--ev-c-text-2);
        margin-bottom: 30px;
        text-align: center;
    }

    .files-list {
        width: 100%;
        margin-top: 30px;
    }

    h2 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--ev-c-text-1);
    }
</style>
