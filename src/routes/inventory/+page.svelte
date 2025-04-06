<script lang="ts">
    let { data } = $props();
    let { almanach } = data;
</script>

<h1 class="font-bold m-4 text-4xl">Inventory</h1>

<div style="justify-items: center;" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-4 items-center justify-center">
    {#each almanach as item}
        <a href="/inventory/{item.id}" class="bg-white shadow-md rounded-lg p-4 flex flex-col gap-4 max-w-48">
            <h2 class="font-bold relative">
                <div class="absolute h-10 w-10 bg-black text-white bottom-0 right-0 m-2 rounded-full flex items-center justify-center">12</div>
                <img class="rounded-md" src="/houby/{item.file_name}" alt="ups, neco se posralo">
            </h2>
        </a>
    {/each}
</div>