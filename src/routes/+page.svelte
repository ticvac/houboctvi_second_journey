<script lang="ts">
    import Map from "./Map.svelte";

    let { data } = $props();
    let { seeds, areas, rituals } = data;

</script>

<Map myPos={[50.0881, 14.3910]} rituals={rituals} seeds={seeds} areas={areas}/>



<a href="/almanach" class="absolute top-0 right-0 p-2 bg-blue-500 text-white rounded-lg m-4">
    Almanach
</a>