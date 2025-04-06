<script>
    let { data } = $props();
    let mushroom = data.mushroom;
</script>

{mushroom.name}
{mushroom.file_name}
<img src="/houby/{mushroom.file_name}" alt="ups, neco se posralo">