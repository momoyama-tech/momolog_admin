export type VideoStatus =
	| 'pending'
	| 'uploading_to_youtube'
	| 'published'
	| 'failed'
	| 'rejected';

export interface Group {
	id: string;
	name: string;
	description: string;
	createdBy: string;
	createdAt: Date;
	youtube?: {
		channelId: string;
		channelTitle: string;
		connected: boolean;
		connectedAt: Date;
	};
}

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface AppUser {
	id: string;
	email: string;
	displayName: string;
	photoURL?: string;
	groupIds: string[];
	role: UserRole;
	createdAt?: Date;
	lastLoginAt?: Date;
}

export interface Video {
	id: string;
	groupId: string;
	uploadedBy: string;
	title: string;
	description: string;
	tags: string[];
	status: VideoStatus;
	storagePath: string;
	storageUrl: string;
	youtubeUrl: string;
	youtubeVideoId: string;
	youtubeError?: string;
	createdAt: Date;
}
// ⚠️ isVisibleOnOfficial は存在しない。official表示はstatus="published"で制御する。
