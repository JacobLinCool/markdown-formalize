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
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="card bg-base-200 shadow-xl border-2 border-dashed border-base-300 w-full min-h-[15rem] max-w-2xl mx-auto flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out my-5 hover:border-primary"
    class:border-primary={dragActive}
    class:bg-base-300={dragActive}
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

    <div class="card-body items-center text-center">
        <div class="mb-4 text-opacity-70 text-primary">
            <Icon icon="lucide:upload-cloud" class="w-16 h-16" />
        </div>
        <h3 class="card-title text-lg">Drag and drop Markdown files here</h3>
        <p class="text-sm opacity-70">
            or <span class="text-primary font-medium">click to select files</span>
        </p>
        <div class="mt-3 badge badge-outline">Supports .md and .markdown files</div>
    </div>
</div>
