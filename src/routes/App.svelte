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
<!--
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
-->

<button
  on:click={signOutUser}
  class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded mb-6"
>
  Sign Out
</button>

<h1 class="text-2xl font-bold mb-4">Your Alarms</h1>

<form
  on:submit={addAlarm}
  class="bg-white shadow-md rounded-lg p-6 mb-6 space-y-4 max-w-md"
>
  <div>
    <label for="alarmDate" class="block text-sm font-medium text-gray-700">Date:</label>
    <input
      type="date"
      id="alarmDate"
      bind:value={alarmDate}
      required
      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label for="alarmTime" class="block text-sm font-medium text-gray-700">Time:</label>
    <input
      type="time"
      id="alarmTime"
      bind:value={alarmTime}
      required
      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label for="alarmPurpose" class="block text-sm font-medium text-gray-700">Purpose:</label>
    <input
      type="text"
      id="alarmPurpose"
      bind:value={alarmPurpose}
      required
      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <button
    type="submit"
    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
  >
    Add Alarm
  </button>
</form>

<ul class="space-y-4 max-w-md">
  {#each $alarms as alarm}
    <li class="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg shadow-sm">
      <div>
        <p class="text-gray-800 font-medium">{new Date(alarm.time).toLocaleString()}</p>
        <p class="text-gray-600 text-sm">{alarm.purpose}</p>
      </div>
      <button
        on:click={() => deleteAlarm(alarm.id)}
        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        Delete
      </button>
    </li>
  {/each}
</ul>
