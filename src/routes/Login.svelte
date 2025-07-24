<script lang="ts">
    import { signInWithGoogle } from '$lib/firebase';
</script>

<button on:click={signInWithGoogle}>Sign in with Google</button>