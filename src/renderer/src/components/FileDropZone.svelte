<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{
        files: { files: File[] };
    }>();

    let dragActive = false;
    let inputRef: HTMLInputElement;

    function handleDragEnter(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = false;
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = false;

        if (e.dataTransfer?.files) {
            const files = Array.from(e.dataTransfer.files);
            const markdownFiles = files.filter(
                (file) => file.name.endsWith(".md") || file.name.endsWith(".markdown"),
            );

            if (markdownFiles.length > 0) {
                // Get file paths if available (Electron-specific)
                const filesWithPaths = markdownFiles.map((file) => {
                    const path = window.api.webUtils.getPathForFile(file);
                    console.log("File path:", path);
                    return Object.assign(file, { path });
                });

                dispatch("files", { files: filesWithPaths });
            }
        }
    }

    function handleButtonClick() {
        inputRef.click();
    }

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files) {
            const files = Array.from(target.files);
            const markdownFiles = files.filter(
                (file) => file.name.endsWith(".md") || file.name.endsWith(".markdown"),
            );

            if (markdownFiles.length > 0) {
                // Get file paths if available (Electron-specific)
                const filesWithPaths = markdownFiles.map((file) => {
                    const path = window.api.webUtils.getPathForFile(file);
                    return Object.assign(file, { path });
                });

                dispatch("files", { files: filesWithPaths });
            }
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="dropzone"
    class:active={dragActive}
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
>
    <input
        type="file"
        accept=".md,.markdown"
        bind:this={inputRef}
        on:change={handleFileChange}
        style="display: none;"
        multiple
    />

    <div class="content">
        <div class="icon">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
        </div>
        <h3>Drag and drop your Markdown files here</h3>
        <p>or</p>
        <button on:click={handleButtonClick}>Browse Files</button>
    </div>
</div>

<style>
    .dropzone {
        width: 100%;
        min-height: 240px;
        max-width: 600px;
        border: 2px dashed var(--ev-c-gray-1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        margin: 20px 0;
    }

    .dropzone.active {
        border-color: #6988e6;
        background-color: rgba(105, 136, 230, 0.05);
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
    }

    .icon {
        margin-bottom: 16px;
        color: var(--ev-c-gray-1);
    }

    .dropzone.active .icon {
        color: #6988e6;
    }

    h3 {
        font-size: 18px;
        margin-bottom: 8px;
        font-weight: 600;
    }

    p {
        margin: 8px 0 16px;
        color: var(--ev-c-text-2);
    }

    button {
        background-color: var(--ev-c-gray-3);
        color: var(--ev-c-text-1);
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    button:hover {
        background-color: var(--ev-c-gray-2);
    }
</style>
