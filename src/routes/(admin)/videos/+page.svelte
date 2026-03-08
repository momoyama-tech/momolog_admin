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
		pending: 'text-yellow-800 bg-yellow-100',
		uploading_to_youtube: 'text-blue-800 bg-blue-100',
		published: 'text-green-800 bg-green-100',
		failed: 'text-red-800 bg-red-100',
		rejected: 'text-gray-800 bg-gray-100'
	};

	let filtered = $derived(
		filterStatus === 'all' ? data.videos : data.videos.filter((v) => v.status === filterStatus)
	);
</script>

<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
	<h2 class="text-2xl font-bold">動画一覧(全団体)</h2>
	<select
		bind:value={filterStatus}
		class="border rounded-lg px-3 py-2 text-sm self-end sm:self-auto bg-white shadow-sm"
	>
		<option value="all">すべて</option>
		{#each Object.entries(statusLabel) as [val, label]}
			<option value={val}>{label}</option>
		{/each}
	</select>
</div>

<!-- Desktop: Table View -->
<div class="hidden md:block bg-white rounded-lg shadow-sm overflow-x-auto">
	<table class="w-full text-sm min-w-[600px]">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-6 py-3 font-medium text-gray-600">タイトル</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">団体名</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">ステータス</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">YouTube</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200">
			{#each filtered as video}
				<tr class="hover:bg-gray-50">
					<td class="px-6 py-4 whitespace-nowrap">
						<a href="/videos/{video.id}" class="text-blue-600 hover:underline font-medium"
							>{video.title}</a
						>
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-gray-600"
						>{data.groupsMap[video.groupId] ?? video.groupId}</td
					>
					<td class="px-6 py-4 whitespace-nowrap">
						<span class="px-2 py-1 rounded-full text-xs font-semibold {statusColor[video.status]}">
							{statusLabel[video.status]}
						</span>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						{#if video.youtubeUrl}
							<a
								href={video.youtubeUrl}
								target="_blank"
								class="text-blue-500 hover:underline text-sm"
							>
								見る
							</a>
						{:else}
							<span class="text-gray-400">—</span>
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="px-6 py-10 text-center text-gray-400">動画がありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Mobile: Card View -->
<div class="md:hidden space-y-4">
	{#if filtered.length > 0}
		{#each filtered as video}
			<div class="bg-white rounded-lg shadow-sm p-4">
				<a href="/videos/{video.id}" class="block mb-3">
					<h3 class="font-bold text-base text-gray-800 hover:text-blue-600 line-clamp-2">
						{video.title}
					</h3>
				</a>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-500">団体名:</span>
						<span class="font-medium text-gray-800 text-right"
							>{data.groupsMap[video.groupId] ?? video.groupId}</span
						>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-500">ステータス:</span>
						<span
							class="px-2 py-1 rounded-full text-xs font-semibold {statusColor[video.status]}"
						>
							{statusLabel[video.status]}
						</span>
					</div>
					<div class="flex justify-between items-center pt-3 border-t mt-3">
						<span class="text-gray-500">YouTube:</span>
						{#if video.youtubeUrl}
							<a
								href={video.youtubeUrl}
								target="_blank"
								class="text-blue-500 font-medium hover:underline"
							>
								YouTubeで見る
							</a>
						{:else}
							<span class="text-gray-400">—</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	{:else}
		<div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400">
			動画がありません
		</div>
	{/if}
</div>
