import { db } from '$lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Video, Group } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const videoId = params.videoId;

	// 動画情報を取得
	const videoDoc = await getDoc(doc(db, 'videos', videoId));
	if (!videoDoc.exists()) {
		throw error(404, '動画が見つかりません');
	}

	const video: Video = {
		id: videoDoc.id,
		...videoDoc.data()
	} as Video;

	// 所属団体情報を取得
	const groupDoc = await getDoc(doc(db, 'groups', video.groupId));
	const group: Group | null = groupDoc.exists()
		? ({
				id: groupDoc.id,
				...groupDoc.data()
			} as Group)
		: null;

	return { video, group };
};
