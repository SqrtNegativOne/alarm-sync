<script lang="ts">
    import { signInWithGoogle } from '$lib/firebase';
</script>

<button class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded mb-6" on:click={signInWithGoogle}>
    Sign in with Google
</button>