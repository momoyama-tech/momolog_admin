<script lang="ts">
	import type { PageData } from './$types';
	import type { VideoStatus } from '$lib/types';

	let { data } = $props<{ data: PageData }>();

	const statusLabel: Record<VideoStatus, string> = {
		pending: '投稿待ち',
		uploading_to_youtube: 'アップロード中',
		published: '投稿完了',
		failed: 'エラー',
		rejected: '却下'
	};

	const statusColor: Record<VideoStatus, string> = {
		pending: 'text-yellow-600',
		uploading_to_youtube: 'text-blue-600',
		published: 'text-green-600',
		failed: 'text-red-600',
		rejected: 'text-gray-500'
	};
</script>

<div class="mb-6">
	<a href="/groups" class="text-sm text-blue-600 hover:underline">← 団体一覧に戻る</a>
</div>

<div class="mb-6">
	<h2 class="text-2xl font-bold mb-2">{data.group.name}</h2>
	<p class="text-gray-600">{data.group.description}</p>
	{#if data.group.youtube?.connected}
		<div class="mt-3 inline-flex items-center gap-2 text-sm">
			<span class="text-green-600 font-medium">YouTube連携済み</span>
			<span class="text-gray-500">({data.group.youtube.channelTitle})</span>
		</div>
	{/if}
</div>

<!-- 所属ユーザー -->
<div class="mb-8">
	<h3 class="text-lg font-bold mb-4">所属ユーザー ({data.users.length})</h3>
	<div class="bg-white rounded-lg shadow-sm overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b">
				<tr>
					<th class="text-left px-4 py-3 font-medium text-gray-600">ユーザーID</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">権限</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">所属団体数</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user}
					<tr class="border-b hover:bg-gray-50">
						<td class="px-4 py-3 font-mono text-xs">{user.id}</td>
						<td class="px-4 py-3">
							<span
								class={user.role === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-600'}
							>
								{user.role ?? 'user'}
							</span>
						</td>
						<td class="px-4 py-3 text-gray-600">{user.groupIds?.length ?? 0}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="px-4 py-6 text-center text-gray-400"
							>所属ユーザーがいません</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- 所属動画 -->
<div>
	<h3 class="text-lg font-bold mb-4">所属動画 ({data.videos.length})</h3>
	<div class="bg-white rounded-lg shadow-sm overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b">
				<tr>
					<th class="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">YouTube</th>
				</tr>
			</thead>
			<tbody>
				{#each data.videos as video}
					<tr class="border-b hover:bg-gray-50">
						<td class="px-4 py-3">
							<a href="/videos/{video.id}" class="text-blue-600 hover:underline">{video.title}</a>
						</td>
						<td class="px-4 py-3 {statusColor[video.status]}">
							{statusLabel[video.status]}
						</td>
						<td class="px-4 py-3">
							{#if video.youtubeUrl}
								<a href={video.youtubeUrl} target="_blank" class="text-blue-500 hover:underline">
									YouTube で見る
								</a>
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="px-4 py-6 text-center text-gray-400">動画がありません</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
