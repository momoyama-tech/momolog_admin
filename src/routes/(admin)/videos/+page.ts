import { db } from '$lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Video, Group } from '$lib/types';

export const load: PageLoad = async () => {
	// Fetch all videos
	const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
	const videosSnapshot = await getDocs(videosQuery);
	const videos: Video[] = videosSnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as Video[];

	// Fetch all groups to create a name map
	const groupsQuery = query(collection(db, 'groups'));
	const groupsSnapshot = await getDocs(groupsQuery);
	const groupsMap: Record<string, string> = {};
	groupsSnapshot.docs.forEach((doc) => {
		const group = doc.data() as Group;
		groupsMap[doc.id] = group.name;
	});

	return { videos, groupsMap };
};
