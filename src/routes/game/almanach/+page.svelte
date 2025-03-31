<script lang="ts">
    let { data } = $props();
    let { almanach } = data;

</script>

<h1 class="m-4 font-bold text-2xl">Mushrooms collected</h1>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-4">
    {#each almanach as item}
        <div class="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4">
            <h2 class="font-bold">{item.name}</h2>
            <div>
                {item.userCount} -> at {item.toxicity} toxicity
            </div>
            <div class="p-2 rounded-md" style="background-color: {item.color};">{item.color}</div>
        </div>
    {/each}
</div>