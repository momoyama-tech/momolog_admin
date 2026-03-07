<script lang="ts">
	import type { PageData } from './$types';
	import type { VideoStatus } from '$lib/types';

	let { data } = $props<{ data: PageData }>();

	let filterStatus = $state<VideoStatus | 'all'>('all');

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

	let filtered = $derived(
		filterStatus === 'all' ? data.videos : data.videos.filter((v) => v.status === filterStatus)
	);
</script>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-2xl font-bold">動画一覧(全団体)</h2>
	<select bind:value={filterStatus} class="border rounded px-3 py-2 text-sm">
		<option value="all">すべて</option>
		{#each Object.entries(statusLabel) as [val, label]}
			<option value={val}>{label}</option>
		{/each}
	</select>
</div>

<div class="bg-white rounded-lg shadow-sm overflow-hidden">
	<table class="w-full text-sm">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">団体ID</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">YouTube</th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as video}
				<tr class="border-b hover:bg-gray-50">
					<td class="px-4 py-3">
						<a href="/videos/{video.id}" class="text-blue-600 hover:underline">{video.title}</a>
					</td>
					<td class="px-4 py-3 text-gray-600">{video.groupId}</td>
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
					<td colspan="4" class="px-4 py-6 text-center text-gray-400">動画がありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
