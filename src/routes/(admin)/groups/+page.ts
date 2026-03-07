import { db } from '$lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Group } from '$lib/types';

export const load: PageLoad = async () => {
	const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
	const snapshot = await getDocs(q);
	const groups: Group[] = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as Group[];
	return { groups };
};
