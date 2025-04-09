<script lang="ts">
    import Icon from "@iconify/svelte";
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
<button
    class="w-full min-h-60 max-w-[600px] border-2 border-dashed border-[var(--ev-c-gray-1)] rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out my-5"
    class:border-[#6988e6]={dragActive}
    class:bg-[rgba(105,136,230,0.05)]={dragActive}
    on:click={handleButtonClick}
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
        class="hidden"
        multiple
    />

    <div class="flex flex-col items-center justify-center p-5 text-center">
        <div class="mb-4 text-[var(--ev-c-gray-1)] active:text-[#6988e6]">
            <Icon icon="lucide:upload" width="48" height="48" />
        </div>
        <h3 class="text-lg font-semibold mb-2">Drag and drop your Markdown files here</h3>
        <p class="text-sm text-[var(--ev-c-gray-2)]">
            or <span class="text-[var(--ev-c-blue-1)]">click to select files</span>
        </p>
    </div>
</button>
