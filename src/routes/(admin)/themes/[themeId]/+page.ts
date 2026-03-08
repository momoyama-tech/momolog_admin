import { db } from '$lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Theme } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const themeId = params.themeId;

	const themeDoc = await getDoc(doc(db, 'themes', themeId));
	if (!themeDoc.exists()) {
		throw error(404, 'テーマが見つかりません');
	}

	const theme: Theme = {
		id: themeDoc.id,
		...themeDoc.data()
	} as Theme;

	return { theme };
};
