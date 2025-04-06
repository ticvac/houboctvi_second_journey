<script lang="ts">
    import Map from "./Map.svelte";

    let { data } = $props();
    let { seeds, areas, rituals } = data;

</script>

<Map myPos={[50.7004203, 15.4772036]} rituals={rituals} seeds={seeds} areas={areas}/>



<a href="/inventory" class="absolute top-0 right-0 p-2 bg-blue-500 text-white rounded-lg m-4">
    Almanach
</a>