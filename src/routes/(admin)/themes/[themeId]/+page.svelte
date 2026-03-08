<script lang="ts">
	import type { PageData } from './$types';
	import { db, storage } from '$lib/firebase';
	import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props<{ data: PageData }>();

	let name = $state(data.theme.name);
	let description = $state(data.theme.description);
	let isUpdating = $state(false);
	let mediaUrl = $state<string | null>(null);
	let loadingMedia = $state(true);

	onMount(async () => {
		if (data.theme.mediaStoragePath) {
			try {
				mediaUrl = await getDownloadURL(ref(storage, data.theme.mediaStoragePath));
			} catch (error) {
				console.error('Failed to get media URL:', error);
			} finally {
				loadingMedia = false;
			}
		} else {
			loadingMedia = false;
		}
	});

	async function updateTheme() {
		if (!name.trim()) return;
		isUpdating = true;
		try {
			const themeRef = doc(db, 'themes', data.theme.id);
			await updateDoc(themeRef, { name: name.trim(), description: description.trim() });
			await invalidateAll();
			alert('更新しました');
		} catch (error) {
			console.error('Failed to update theme:', error);
			alert('テーマの更新に失敗しました。');
		} finally {
			isUpdating = false;
		}
	}

	async function toggleActive() {
		isUpdating = true;
		try {
			const themeRef = doc(db, 'themes', data.theme.id);
			await updateDoc(themeRef, { active: !data.theme.active });
			await invalidateAll();
		} catch (error) {
			console.error('Failed to toggle active state:', error);
		} finally {
			isUpdating = false;
		}
	}

	async function deleteTheme() {
		if (!confirm('本当にこのテーマを削除しますか？この操作は元に戻せません。')) return;
		isUpdating = true;
		try {
			await deleteDoc(doc(db, 'themes', data.theme.id));
			// Note: Deleting the file from storage is omitted for simplicity,
			// but should be implemented in a real-world scenario via a cloud function.
			alert('テーマを削除しました。');
			goto('/themes');
		} catch (error) {
			console.error('Failed to delete theme:', error);
			alert('テーマの削除に失敗しました。');
			isUpdating = false;
		}
	}
</script>

<div class="mb-6">
	<a href="/themes" class="text-sm text-blue-600 hover:underline">← テーマ一覧に戻る</a>
</div>

<div class="max-w-4xl mx-auto">
	<div class="bg-white rounded-lg shadow-sm p-6">
		<div class="flex justify-between items-start">
			<h2 class="text-2xl font-bold mb-4">テーマ編集</h2>
			<button
				onclick={toggleActive}
				disabled={isUpdating}
				class="text-sm px-3 py-1 rounded-full {data.theme.active
					? 'bg-green-100 text-green-700'
					: 'bg-gray-100 text-gray-600'}"
			>
				{data.theme.active ? '有効' : '無効'}
			</button>
		</div>

		<div class="space-y-4">
			<div>
				<label for="theme-name" class="block text-sm font-medium text-gray-700 mb-1"
					>テーマ名</label
				>
				<input
					id="theme-name"
					type="text"
					bind:value={name}
					class="w-full border rounded px-3 py-2 text-sm"
					required
				/>
			</div>

			<div>
				<label for="theme-desc" class="block text-sm font-medium text-gray-700 mb-1">説明</label>
				<textarea
					id="theme-desc"
					rows="3"
					bind:value={description}
					class="w-full border rounded px-3 py-2 text-sm"
				></textarea>
			</div>

			<div>
				<span class="block text-sm font-medium text-gray-700 mb-1">メディアプレビュー</span>
				{#if loadingMedia}
					<div class="text-sm text-gray-500">メディアを読み込み中...</div>
				{:else if mediaUrl}
					{#if data.theme.type === 'bgm'}
						<audio controls src={mediaUrl} class="w-full">
							Your browser does not support the audio element.
						</audio>
					{:else if data.theme.type === 'chromakey'}
						<video controls src={mediaUrl} class="w-full rounded-lg max-h-60">
							Your browser does not support the video tag.
						</video>
					{/if}
				{:else}
					<div class="text-sm text-gray-500">プレビューはありません。</div>
				{/if}
			</div>
		</div>

		<div class="flex justify-between items-center mt-6 pt-6 border-t">
			<div>
				<button
					onclick={updateTheme}
					disabled={isUpdating}
					class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
				>
					{isUpdating ? '保存中...' : '保存'}
				</button>
			</div>
			<button
				onclick={deleteTheme}
				disabled={isUpdating}
				class="text-sm text-red-600 hover:underline disabled:opacity-50"
			>
				このテーマを削除する
			</button>
		</div>
	</div>
</div>
