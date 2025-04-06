<script>
    let { data } = $props();
    let mushroom = data.mushroom;
</script>

<div class="m-4 flex flex-col gap-4">
    
    {#if data.can_access}
    <h1 class="font-bold text-2xl">{mushroom.name}</h1>
    <p>{@html data.info}</p>
    {:else}
    <p class="font-bold mt-5">Ty, ty, ty... Pro tuto stránku almanachu ještě chvíli hledej;)</p>
    {/if}
    

    <img class="rounded-lg shadow-md" src="/houby/{mushroom.file_name}" alt="ups, neco se posralo">

</div>

