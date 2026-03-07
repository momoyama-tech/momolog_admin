import { db } from '$lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Video } from '$lib/types';

export const load: PageLoad = async () => {
	const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
	const snapshot = await getDocs(q);
	const videos: Video[] = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as Video[];
	return { videos };
};
