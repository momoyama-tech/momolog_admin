import { db } from '$lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Group, AppUser, Video } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const groupId = params.groupId;

	// 団体情報を取得
	const groupDoc = await getDoc(doc(db, 'groups', groupId));
	if (!groupDoc.exists()) {
		throw error(404, '団体が見つかりません');
	}

	const group: Group = {
		id: groupDoc.id,
		...groupDoc.data()
	} as Group;

	// この団体に所属するユーザーを取得
	const usersQuery = query(collection(db, 'users'), where('groupIds', 'array-contains', groupId));
	const usersSnapshot = await getDocs(usersQuery);
	const users: AppUser[] = usersSnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as AppUser[];

	// この団体の動画を取得
	const videosQuery = query(collection(db, 'videos'), where('groupId', '==', groupId));
	const videosSnapshot = await getDocs(videosQuery);
	const videos: Video[] = videosSnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as Video[];

	return { group, users, videos };
};
