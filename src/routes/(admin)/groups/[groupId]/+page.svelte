<script lang="ts">
	import type { PageData } from './$types';
	import type { VideoStatus, UserRole } from '$lib/types';
	import { db } from '$lib/firebase';
	import { doc, updateDoc } from 'firebase/firestore';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props<{ data: PageData }>();

	let editingName = $state(false);
	let newName = $state(data.group.name);
	let isUpdating = $state(false);

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

	const roleLabels: Record<UserRole, string> = {
		user: '一般ユーザー',
		admin: '管理者',
		superadmin: 'スーパー管理者'
	};

	const roleColors: Record<UserRole, string> = {
		user: 'text-gray-600',
		admin: 'text-blue-600',
		superadmin: 'text-purple-600'
	};

	function startEditing() {
		newName = data.group.name;
		editingName = true;
	}

	async function updateGroupName() {
		if (!newName || newName === data.group.name) {
			editingName = false;
			return;
		}
		isUpdating = true;
		try {
			const groupRef = doc(db, 'groups', $page.params.groupId);
			await updateDoc(groupRef, { name: newName });
			await invalidateAll(); // Reload data
			editingName = false;
		} catch (error) {
			console.error('Failed to update group name:', error);
			alert('団体名の更新に失敗しました。');
		} finally {
			isUpdating = false;
		}
	}
</script>

<div class="mb-6">
	<a href="/groups" class="text-sm text-blue-600 hover:underline">← 団体一覧に戻る</a>
</div>

<div class="mb-6">
	{#if editingName}
		<div class="flex items-center gap-2">
			<input
				type="text"
				bind:value={newName}
				class="text-2xl font-bold border-b-2 py-1"
				disabled={isUpdating}
			/>
			<button
				onclick={updateGroupName}
				class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
				disabled={isUpdating}
			>
				{isUpdating ? '保存中...' : '保存'}
			</button>
			<button
				onclick={() => (editingName = false)}
				class="px-3 py-1 text-sm hover:bg-gray-100 rounded"
				disabled={isUpdating}>キャンセル</button
			>
		</div>
	{:else}
		<div class="flex items-center gap-4">
			<h2 class="text-2xl font-bold">{data.group.name}</h2>
			<button onclick={startEditing} class="text-sm text-blue-600 hover:underline">変更</button>
		</div>
	{/if}

	<p class="text-gray-600 mt-2">{data.group.description}</p>
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
					<th class="text-left px-4 py-3 font-medium text-gray-600">ユーザー名</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">メールアドレス</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">権限</th>
					<th class="text-left px-4 py-3 font-medium text-gray-600">所属団体数</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user}
					<tr class="border-b hover:bg-gray-50">
						<td class="px-4 py-3">
							<div class="flex items-center gap-2">
								{#if user.photoURL}
									<img
										src={user.photoURL}
										alt={user.displayName}
										class="w-6 h-6 rounded-full"
									/>
								{/if}
								<span class="font-medium">{user.displayName || 'Unknown'}</span>
							</div>
						</td>
						<td class="px-4 py-3 text-gray-600 text-xs">{user.email || '—'}</td>
						<td class="px-4 py-3">
							<span class="{roleColors[user.role ?? 'user']} font-medium">
								{roleLabels[user.role ?? 'user']}
							</span>
						</td>
						<td class="px-4 py-3 text-gray-600">{user.groupIds?.length ?? 0}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="px-4 py-6 text-center text-gray-400"
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
