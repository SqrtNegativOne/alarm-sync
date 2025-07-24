<script lang="ts">
	import {
		user,
		signOutUser,
		addAlarm as firebaseAddAlarm,
		removeAlarm as firebaseRemoveAlarm
	} from '$lib/firebase';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import {
		getFirestore,
		collection,
		query,
		where,
		getDocs,
		type DocumentData
	} from 'firebase/firestore';

	let alarmDate = '';
	let alarmTime = '';
	let alarmPurpose = '';
	let alarms = writable<DocumentData[]>([]);

	async function fetchAlarms() {
		const u = get(user);
		if (!u) return;
		const db = getFirestore();
		const q = query(collection(db, 'alarms'), where('uid', '==', u.uid));
		const snapshot = await getDocs(q);
		const results: DocumentData[] = [];
		snapshot.forEach((doc) => {
			results.push({ id: doc.id, ...doc.data() });
		});
		alarms.set(results);
	}

	onMount(fetchAlarms);

	function combineDateTime(date: string, time: string): string {
		// Assumes local time; converts to ISO 8601
		const [year, month, day] = date.split('-').map(Number);
		const [hour, minute] = time.split(':').map(Number);
		const iso = new Date(year, month - 1, day, hour, minute).toISOString();
		return iso;
	}

	async function addAlarm(event: SubmitEvent) {
		event.preventDefault();
		const u = get(user);
		if (!u) return;

		if (!alarmDate || !alarmTime) {
			console.error('Date and Time are required');
			return;
		}

		const isoTime = combineDateTime(alarmDate, alarmTime);

		await firebaseAddAlarm({
			uid: u.uid,
			purpose: alarmPurpose,
			time: isoTime
		});
		alarmDate = '';
		alarmTime = '';
		alarmPurpose = '';
		await fetchAlarms();
	}

	async function deleteAlarm(alarmId: string) {
		const a = get(alarms).find((a) => a.id === alarmId);
		if (!a) return;
		await firebaseRemoveAlarm(a.uid, a.time);
		await fetchAlarms();
	}
</script>

<button on:click={signOutUser}>Sign Out</button>

<h1>Your Alarms</h1>
<form on:submit={addAlarm}>
	<label for="alarmDate">Date:</label>
	<input type="date" id="alarmDate" bind:value={alarmDate} required />

	<label for="alarmTime">Time:</label>
	<input type="time" id="alarmTime" bind:value={alarmTime} required />

	<label for="alarmPurpose">Purpose:</label>
	<input type="text" id="alarmPurpose" bind:value={alarmPurpose} required />

	<button type="submit">Add Alarm</button>
</form>

<ul>
	{#each $alarms as alarm}
		<li>
			{new Date(alarm.time).toLocaleString()} — {alarm.purpose}
			<button on:click={() => deleteAlarm(alarm.id)}>Delete</button>
		</li>
	{/each}
</ul>
