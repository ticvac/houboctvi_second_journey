<script lang="ts">
    let { data } = $props();
    let { almanach } = data;
</script>


<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-4">
    {#each almanach as item}
        <div class="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4">
            <h2 class="font-bold">{item.name}</h2>
            <p>{item.toxicity}</p>
            <div class="p-2 rounded-md" style="background-color: {item.color};">{item.color}</div>
        </div>
    {/each}
</div>