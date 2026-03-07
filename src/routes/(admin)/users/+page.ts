import { db } from '$lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { AppUser } from '$lib/types';

export const load: PageLoad = async () => {
	const snapshot = await getDocs(collection(db, 'users'));
	const users: AppUser[] = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as AppUser[];
	return { users };
};
