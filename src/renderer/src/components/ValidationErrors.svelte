<script lang="ts">
    import Icon from "@iconify/svelte";
    export let errors: { type: string; resource: string; error: string }[] = [];
    export let onClose = () => {}; // Add onClose handler
</script>

{#if errors.length > 0}
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Icon icon="lucide:alert-triangle" class="w-6 h-6 text-error" />
                <h3 class="text-xl font-bold">Validation Errors</h3>
            </div>
            <button class="btn btn-sm btn-ghost" on:click={onClose}>
                <Icon icon="lucide:x" class="w-5 h-5" />
            </button>
        </div>

        <div class="divider my-1"></div>

        <div class="flex flex-col gap-4">
            {#each errors as error}
                <div class="card bg-base-100 shadow-sm border-l-4 border-error">
                    <div class="card-body p-4">
                        <h4
                            class="card-title text-sm font-semibold capitalize flex items-center gap-2"
                        >
                            <Icon icon="lucide:x-circle" class="w-4 h-4 text-error" />
                            {error.type}
                        </h4>

                        <div class="text-xs opacity-80 break-all mb-2">
                            {error.resource}
                        </div>

                        <div class="bg-base-200 p-3 rounded-md text-sm">
                            {error.error}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{:else}
    <div class="flex flex-col items-center justify-center h-full">
        <Icon icon="lucide:check-circle" class="w-16 h-16 text-success opacity-50" />
        <p class="mt-4 text-center text-base-content/70">No validation errors to display</p>
        <button class="btn btn-sm btn-ghost mt-4" on:click={onClose}>
            <Icon icon="lucide:x" class="w-4 h-4 mr-2" />
            Close
        </button>
    </div>
{/if}
