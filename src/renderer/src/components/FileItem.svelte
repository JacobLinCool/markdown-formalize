<script lang="ts">
    import Icon from "@iconify/svelte";

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

<div
    class="flex justify-between p-3 px-4 bg-[var(--ev-c-black-mute)] rounded-lg mb-2.5 max-w-[600px] w-full transition-all duration-300 ease-in-out sm:flex-row flex-col sm:items-center items-start"
    class:border-l-4={status === "success" || status === "error"}
    class:border-[#4caf50]={status === "success"}
    class:border-[#ff5757]={status === "error"}
>
    <div class="flex items-center w-full">
        <div class="mr-3 flex items-center text-[#ff5757] success:text-[#4caf50]">
            {#if status === "processing"}
                <Icon icon="lucide:timer" width="20" height="20" />
            {:else if status === "success"}
                <Icon icon="lucide:check-circle" width="20" height="20" />
            {:else}
                <Icon icon="lucide:alert-circle" width="20" height="20" />
            {/if}
        </div>
        <div
            class="font-semibold mr-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
        >
            {fileName}
        </div>
        <div class="text-sm text-[var(--ev-c-text-2)]">
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
        <div class="flex gap-2 sm:mt-0 mt-3 w-full sm:w-auto justify-end">
            <button
                class="flex items-center gap-1.5 bg-[var(--ev-c-gray-3)] text-[var(--ev-c-text-1)] border-none py-1.5 px-3 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 ease-in-out hover:bg-[var(--ev-c-gray-2)]"
                on:click={handleDownload}
            >
                <Icon icon="lucide:external-link" width="16" height="16" />
                Open PDF
            </button>
            <button
                class="flex items-center gap-1.5 bg-[var(--ev-c-gray-3)] text-[var(--ev-c-text-1)] border-none py-1.5 px-3 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 ease-in-out hover:bg-[var(--ev-c-gray-2)]"
                on:click={handleShowInFolder}
            >
                <Icon icon="lucide:folder" width="16" height="16" />
                Show in Folder
            </button>
        </div>
    {/if}
</div>
