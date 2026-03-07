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

export interface AppUser {
	id: string;
	groupIds: string[];
	role: 'user' | 'admin';
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
