<!-- filepath: /Users/jacoblincool/Documents/GitHub/markdown-formalize/src/renderer/src/components/FileItem.svelte -->
<script lang="ts">
    export let fileName: string;
    export let status: "processing" | "success" | "error" = "processing";
    export let errors: { type: string; resource: string; error: string }[] = [];
    export let pdfPath: string | null = null;

    function handleDownload() {
        if (pdfPath) {
            window.electron.ipcRenderer.send("open-pdf", pdfPath);
        }
    }

    function handleShowInFolder() {
        if (pdfPath) {
            window.electron.ipcRenderer.send("show-in-folder", pdfPath);
        }
    }
</script>

<div class="file-item" class:success={status === "success"} class:error={status === "error"}>
    <div class="file-info">
        <div class="status-icon">
            {#if status === "processing"}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            {:else if status === "success"}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            {:else}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            {/if}
        </div>
        <div class="file-name">{fileName}</div>
        <div class="file-status">
            {#if status === "processing"}
                Processing...
            {:else if status === "success"}
                Conversion complete
            {:else}
                Conversion completed with errors
            {/if}
        </div>
    </div>

    {#if status !== "processing" && pdfPath}
        <div class="actions">
            <button class="action-btn" on:click={handleDownload}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Open PDF
            </button>
            <button class="action-btn" on:click={handleShowInFolder}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                    ></path>
                </svg>
                Show in Folder
            </button>
        </div>
    {/if}
</div>

<style>
    .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background-color: var(--ev-c-black-mute);
        border-radius: 8px;
        margin-bottom: 10px;
        max-width: 600px;
        width: 100%;
        transition: all 0.3s ease;
    }

    .file-item.success {
        border-left: 4px solid #4caf50;
    }

    .file-item.error {
        border-left: 4px solid #ff5757;
    }

    .file-info {
        display: flex;
        align-items: center;
    }

    .status-icon {
        margin-right: 12px;
        display: flex;
        align-items: center;
    }

    .success .status-icon {
        color: #4caf50;
    }

    .error .status-icon {
        color: #ff5757;
    }

    .file-name {
        font-weight: 600;
        margin-right: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }

    .file-status {
        font-size: 14px;
        color: var(--ev-c-text-2);
    }

    .actions {
        display: flex;
        gap: 8px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: var(--ev-c-gray-3);
        color: var(--ev-c-text-1);
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .action-btn:hover {
        background-color: var(--ev-c-gray-2);
    }

    @media (max-width: 600px) {
        .file-item {
            flex-direction: column;
            align-items: flex-start;
        }

        .actions {
            margin-top: 12px;
            width: 100%;
            justify-content: flex-end;
        }

        .file-info {
            width: 100%;
        }
    }
</style>
