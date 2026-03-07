import { writable } from 'svelte/store';
import { auth } from '$lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export const currentUser = writable<User | null>(null);
export const authLoading = writable(true);

onAuthStateChanged(auth, (user) => {
	currentUser.set(user);
	authLoading.set(false);
});
