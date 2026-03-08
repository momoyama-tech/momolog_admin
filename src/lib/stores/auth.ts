import { writable } from 'svelte/store';
import { auth } from '$lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { syncUserToFirestore } from '$lib/utils/user';

export const currentUser = writable<User | null>(null);
export const authLoading = writable(true);

onAuthStateChanged(auth, async (user) => {
	currentUser.set(user);
	// ユーザーがログイン済みの場合、Firestoreに情報を同期
	if (user) {
		try {
			await syncUserToFirestore(user);
		} catch (error) {
			console.error('ユーザー情報の同期に失敗:', error);
		}
	}
	authLoading.set(false);
});
