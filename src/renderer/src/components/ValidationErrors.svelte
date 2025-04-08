<!-- filepath: /Users/jacoblincool/Documents/GitHub/markdown-formalize/src/renderer/src/components/ValidationErrors.svelte -->
<script lang="ts">
    export let errors: { type: string; resource: string; error: string }[] = [];
</script>

{#if errors.length > 0}
    <div class="validation-errors">
        <h3>Validation Errors</h3>
        <ul>
            {#each errors as error}
                <li>
                    <span class="error-type">{error.type}:</span>
                    <span class="error-resource">{error.resource}</span>
                    <span class="error-message">{error.error}</span>
                </li>
            {/each}
        </ul>
    </div>
{/if}

<style>
    .validation-errors {
        margin-top: 20px;
        padding: 16px;
        border-radius: 8px;
        background-color: rgba(255, 87, 87, 0.1);
        border-left: 4px solid #ff5757;
        max-width: 600px;
        width: 100%;
    }

    h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #ff5757;
    }

    ul {
        margin: 0;
        padding: 0;
    }

    li {
        margin-bottom: 8px;
        line-height: 1.4;
        display: flex;
        flex-direction: column;
    }

    li:last-child {
        margin-bottom: 0;
    }

    .error-type {
        font-weight: 600;
        text-transform: capitalize;
    }

    .error-resource {
        opacity: 0.7;
        word-break: break-all;
        margin: 2px 0;
    }

    .error-message {
        font-style: italic;
        opacity: 0.9;
    }
</style>
