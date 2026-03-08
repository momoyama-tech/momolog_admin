<script lang="ts">
	import type { PageData } from './$types';
	import type { VideoStatus } from '$lib/types';
	import { db } from '$lib/firebase';
	import { doc, updateDoc } from 'firebase/firestore';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	let editMode = $state(false);
	let editTitle = $state(data.video.title);
	let editDescription = $state(data.video.description);
	let editTags = $state(data.video.tags.join(', '));
	let saving = $state(false);

	const statusLabel: Record<VideoStatus, string> = {
		pending: '投稿待ち',
		uploading_to_youtube: 'アップロード中',
		published: '投稿完了',
		failed: 'エラー',
		rejected: '却下'
	};

	const statusColor: Record<VideoStatus, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		uploading_to_youtube: 'bg-blue-100 text-blue-800',
		published: 'bg-green-100 text-green-800',
		failed: 'bg-red-100 text-red-800',
		rejected: 'bg-gray-100 text-gray-800'
	};

	async function saveChanges() {
		saving = true;
		try {
			await updateDoc(doc(db, 'videos', data.video.id), {
				title: editTitle,
				description: editDescription,
				tags: editTags
					.split(',')
					.map((t) => t.trim())
					.filter((t) => t)
			});
			await invalidateAll();
			editMode = false;
		} catch (e) {
			alert('保存に失敗しました');
		} finally {
			saving = false;
		}
	}

	function cancelEdit() {
		editTitle = data.video.title;
		editDescription = data.video.description;
		editTags = data.video.tags.join(', ');
		editMode = false;
	}
</script>

<div class="mb-6">
	<a href="/videos" class="text-sm text-blue-600 hover:underline">← 動画一覧に戻る</a>
</div>

<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
	<div class="flex justify-between items-start mb-4">
		<div>
			<h2 class="text-2xl font-bold mb-2">{data.video.title}</h2>
			<span class="inline-block px-3 py-1 text-sm rounded-full {statusColor[data.video.status]}">
				{statusLabel[data.video.status]}
			</span>
		</div>
		{#if !editMode}
			<button
				onclick={() => (editMode = true)}
				class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
			>
				編集
			</button>
		{/if}
	</div>

	{#if editMode}
		<!-- 編集モード -->
		<div class="space-y-4 border-t pt-4">
			<div>
				<label for="title" class="block text-sm font-medium mb-1">タイトル</label>
				<input
					id="title"
					bind:value={editTitle}
					class="w-full border rounded px-3 py-2 text-sm"
				/>
			</div>
			<div>
				<label for="description" class="block text-sm font-medium mb-1">説明</label>
				<textarea
					id="description"
					bind:value={editDescription}
					rows="4"
					class="w-full border rounded px-3 py-2 text-sm"
				></textarea>
			</div>
			<div>
				<label for="tags" class="block text-sm font-medium mb-1">タグ (カンマ区切り)</label>
				<input id="tags" bind:value={editTags} class="w-full border rounded px-3 py-2 text-sm" />
			</div>
			<div class="flex gap-3">
				<button
					onclick={saveChanges}
					disabled={saving}
					class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
				>
					{saving ? '保存中...' : '保存'}
				</button>
				<button
					onclick={cancelEdit}
					disabled={saving}
					class="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
				>
					キャンセル
				</button>
			</div>
		</div>
	{:else}
		<!-- 表示モード -->
		<div class="space-y-4 border-t pt-4">
			<div>
				<h3 class="text-sm font-medium text-gray-600 mb-1">説明</h3>
				<p class="text-gray-800">{data.video.description || '説明なし'}</p>
			</div>
			<div>
				<h3 class="text-sm font-medium text-gray-600 mb-1">タグ</h3>
				<div class="flex gap-2 flex-wrap">
					{#each data.video.tags as tag}
						<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{tag}</span>
					{:else}
						<span class="text-gray-400 text-sm">タグなし</span>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- メタデータ -->
<div class="grid grid-cols-2 gap-6">
	<div class="bg-white rounded-lg shadow-sm p-6">
		<h3 class="text-lg font-bold mb-4">動画情報</h3>
		<dl class="space-y-3 text-sm">
			<div>
				<dt class="text-gray-600">動画ID</dt>
				<dd class="font-mono text-xs text-gray-800">{data.video.id}</dd>
			</div>
			<div>
				<dt class="text-gray-600">所属団体</dt>
				<dd>
					{#if data.group}
						<a href="/groups/{data.group.id}" class="text-blue-600 hover:underline"
							>{data.group.name}</a
						>
					{:else}
						<span class="text-gray-400">不明</span>
					{/if}
				</dd>
			</div>
			<div>
				<dt class="text-gray-600">投稿者UID</dt>
				<dd class="font-mono text-xs text-gray-800">{data.video.uploadedBy}</dd>
			</div>
			<div>
				<dt class="text-gray-600">作成日時</dt>
				<dd class="text-gray-800">
					{new Date(data.video.createdAt).toLocaleString('ja-JP')}
				</dd>
			</div>
		</dl>
	</div>

	<div class="bg-white rounded-lg shadow-sm p-6">
		<h3 class="text-lg font-bold mb-4">YouTube情報</h3>
		<dl class="space-y-3 text-sm">
			{#if data.video.youtubeUrl}
				<div>
					<dt class="text-gray-600">YouTube URL</dt>
					<dd>
						<a
							href={data.video.youtubeUrl}
							target="_blank"
							class="text-blue-600 hover:underline break-all"
						>
							{data.video.youtubeUrl}
						</a>
					</dd>
				</div>
				<div>
					<dt class="text-gray-600">YouTube 動画ID</dt>
					<dd class="font-mono text-xs text-gray-800">{data.video.youtubeVideoId}</dd>
				</div>
			{:else}
				<p class="text-gray-400">YouTube未投稿</p>
			{/if}

			{#if data.video.youtubeError}
				<div>
					<dt class="text-red-600 font-medium">エラー内容</dt>
					<dd class="text-red-800 text-xs mt-1">{data.video.youtubeError}</dd>
				</div>
			{/if}
		</dl>
	</div>
</div>
