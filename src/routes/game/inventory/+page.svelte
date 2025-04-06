<script lang="ts">
    let { data } = $props();
    let { almanach } = data;

</script>

<!-- <h1 class="m-4 font-bold text-2xl">Inventory</h1>

<h2 class="m-4 font-bold">Almanach</h2>

<h2 class="m-4 font-bold">Mushrooms</h2>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-4">
    {#each almanach as item}
        <div class="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4">
            <h2 class="font-bold">{item.name}</h2>
            <div>
                {item.userCount} 
            </div>
            <div class="p-2 rounded-md" style="background-color: {item.color};">{item.color}</div>
        </div>
    {/each}
</div> -->


<h1 class="font-bold m-4 text-4xl">Inventory</h1>

<div style="justify-items: center;" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-4 items-center justify-center">
    {#each almanach as item}
        <a href="/game/inventory/{item.id}" class="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4 max-w-48">
            <h2 class="font-bold relative">
                <div class="absolute h-10 w-10 text-white bottom-0 right-0 m-2 rounded-full flex items-center justify-center {item.can_access ? "bg-yellow-500" : "bg-black"}">{item.userCount}</div>
                <img class="rounded-md" src="/houby/{item.file_name}" alt="ups, neco se posralo">
            </h2>
            <!-- {#if item.can_access}
                <div class="p-2 rounded-md" style="background-color: {item.color};">{item.color}</div>
            {/if} -->
        </a>
    {/each}
</div>