import { db } from '$lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * ログイン時にユーザー情報をFirestoreに保存または更新する
 */
export async function syncUserToFirestore(user: User): Promise<void> {
	const userRef = doc(db, 'users', user.uid);
	const userDoc = await getDoc(userRef);

	// undefinedを除外したデータオブジェクトを作成
	const userData: Record<string, any> = {
		email: user.email || '',
		displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
		lastLoginAt: serverTimestamp()
	};

	// photoURLがある場合のみ追加
	if (user.photoURL) {
		userData.photoURL = user.photoURL;
	}

	if (!userDoc.exists()) {
		// 新規ユーザーの場合
		await setDoc(userRef, {
			...userData,
			groupIds: [],
			role: 'user',
			createdAt: serverTimestamp()
		});
	} else {
		// 既存ユーザーの場合は最終ログイン時刻とプロフィール情報のみ更新
		await setDoc(userRef, userData, { merge: true });
	}
}
