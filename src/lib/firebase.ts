import { initializeApp } from 'firebase/app';
import {
	getAuth,
	onAuthStateChanged,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	type User
} from 'firebase/auth';
import {
	getFirestore,
	collection,
	addDoc,
	deleteDoc,
	doc,
	query,
	where,
	getDocs
} from 'firebase/firestore';
import { writable, type Writable } from 'svelte/store';

import { firebaseConfig } from './firebaseConfig'
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Store for current user
export const user: Writable<User | null> = writable(null);

// Monitor auth state
onAuthStateChanged(auth, (firebaseUser) => {
	user.set(firebaseUser);
});

// Authentication API
export async function signInWithGoogle(): Promise<void> {
	const provider = new GoogleAuthProvider();
	try {
		await signInWithPopup(auth, provider);
	} catch (err) {
		console.error('Google sign-in failed:', err);
	}
}

export async function signOutUser(): Promise<void> {
	try {
		await signOut(auth);
	} catch (err) {
		console.error('Sign out failed:', err);
	}
}

// Alarm operations
interface Alarm {
	uid: string;
	purpose: string;
	time: string; // ISO 8601 or unix timestamp
}

const alarmsCollection = collection(db, 'alarms');

export async function addAlarm(alarm: Alarm): Promise<void> {
	try {
		await addDoc(alarmsCollection, alarm);
	} catch (err) {
		console.error('Failed to add alarm:', err);
	}
}

export async function removeAlarm(uid: string, time: string): Promise<void> {
	try {
		const q = query(
			alarmsCollection,
			where('uid', '==', uid),
			where('time', '==', time)
		);
		const snapshot = await getDocs(q);
		snapshot.forEach(async (docSnap) => {
			await deleteDoc(doc(db, 'alarms', docSnap.id));
		});
	} catch (err) {
		console.error('Failed to remove alarm:', err);
	}
}
