<script lang="ts">
	import { user } from '$lib/firebase';
	import App from './App.svelte';
	import Login from './Login.svelte';
</script>

{#if $user}
	<App />
{:else}
	<Login />
{/if}
