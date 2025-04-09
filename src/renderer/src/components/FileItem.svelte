<script lang="ts">
    import Icon from "@iconify/svelte";

    export let fileName: string;
    export let status: "processing" | "success" | "error" = "processing";
    export let errors: { type: string; resource: string; error: string }[] = [];
    export let pdfPath: string | null = null;
    export let showErrors: (
        error: { type: string; resource: string; error: string }[],
    ) => void = () => {};

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="card bg-base-200 shadow-sm w-full transition-all duration-300 hover:shadow-md {status ===
    'error'
        ? 'border-l-4 border-l-error'
        : status === 'success'
          ? 'border-l-4 border-l-success'
          : ''}"
    on:click={() => showErrors(errors)}
>
    <div class="card-body p-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-1 min-w-48">
                <div class="avatar placeholder">
                    {#if status === "processing"}
                        <Icon icon="lucide:timer" class="w-5 h-5" />
                    {:else if status === "success"}
                        <Icon icon="lucide:file-check" class="w-5 h-5" />
                    {:else}
                        <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-error" />
                    {/if}
                </div>

                <div class="flex flex-col items-start">
                    <span class="font-medium truncate max-w-48">{fileName}</span>
                    <span class="text-xs opacity-70">
                        {#if status === "processing"}
                            <span class="text-info">Processing...</span>
                        {:else if status === "success"}
                            <span class="text-success">Conversion complete</span>
                        {:else}
                            <span class="text-error">
                                {errors.length}
                                {errors.length === 1 ? "error" : "errors"} found
                            </span>
                        {/if}
                    </span>
                </div>
            </div>

            {#if status !== "processing" && pdfPath}
                <div class="flex gap-2 justify-end">
                    <button class="btn btn-sm btn-primary" on:click={handleDownload}>
                        <Icon icon="lucide:file" class="w-4 h-4" />
                        Open PDF
                    </button>

                    <button class="btn btn-sm btn-outline" on:click={handleShowInFolder}>
                        <Icon icon="lucide:folder" class="w-4 h-4" />
                        Show in Folder
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>
