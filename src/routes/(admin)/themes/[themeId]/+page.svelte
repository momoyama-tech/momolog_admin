<script lang="ts">
	import type { PageData } from './$types';
	import { db, storage } from '$lib/firebase';
	import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
	import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
	import { invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props<{ data: PageData }>();

	// Edit form state
	let name = $state(data.theme.name);
	let description = $state(data.theme.description);
	let isUpdating = $state(false);

	// Media state
	let mediaUrl = $state<string | null>(null);
	let loadingMedia = $state(true);
	let newMediaFile = $state<File | null>(null);
	let uploadProgress = $state(0);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) newMediaFile = file;
	}

	function getAcceptType(): string {
		return data.theme.type === 'bgm' ? 'audio/*' : 'video/*';
	}

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

	async function replaceMedia() {
		if (!newMediaFile) return;

		isUpdating = true;
		uploadProgress = 0;

		try {
			// Determine new storage path in case file extension changes
			const newExt = newMediaFile.name.substring(newMediaFile.name.lastIndexOf('.'));
			const storagePath = `themes/${data.theme.id}/media${newExt}`;

			// Upload new file (overwrites if path is same, creates new if different)
			const storageRef = ref(storage, storagePath);
			const uploadTask = uploadBytesResumable(storageRef, newMediaFile);

			await new Promise<void>((resolve, reject) => {
				uploadTask.on(
					'state_changed',
					(snapshot) => {
						uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					},
					(error) => reject(error),
					() => resolve()
				);
			});

			// Update Firestore doc if storage path changed
			if (storagePath !== data.theme.mediaStoragePath) {
				await updateDoc(doc(db, 'themes', data.theme.id), {
					mediaStoragePath: storagePath,
					updatedAt: new Date()
				});
			} else {
				await updateDoc(doc(db, 'themes', data.theme.id), {
					updatedAt: new Date()
				});
			}

			alert('メディアを差し替えました。');
			newMediaFile = null;
			await invalidateAll();
			// Refresh preview
			loadingMedia = true;
			mediaUrl = await getDownloadURL(storageRef);
			loadingMedia = false;
		} catch (e) {
			alert('メディアの差し替えに失敗しました: ' + (e as Error).message);
		} finally {
			isUpdating = false;
			uploadProgress = 0;
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

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Edit Form -->
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
		</div>

		<div class="flex justify-start items-center mt-6 pt-6 border-t">
			<button
				onclick={updateTheme}
				disabled={isUpdating}
				class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
			>
				{isUpdating ? '保存中...' : 'テキスト情報を保存'}
			</button>
		</div>
	</div>

	<!-- Media Section -->
	<div class="bg-white rounded-lg shadow-sm p-6">
		<h3 class="text-lg font-semibold mb-4">メディア</h3>
		<div>
			<span class="block text-sm font-medium text-gray-700 mb-2">現在のメディア</span>
			{#if loadingMedia}
				<div class="text-sm text-gray-500">メディアを読み込み中...</div>
			{:else if mediaUrl}
				{#if data.theme.type === 'bgm'}
					<audio controls src={mediaUrl} class="w-full">
						Your browser does not support the audio element.
					</audio>
				{:else if data.theme.type === 'chromakey'}
					<video controls src={mediaUrl} class="w-full rounded-lg max-h-60 bg-gray-100">
						Your browser does not support the video tag.
					</video>
				{/if}
			{:else}
				<div class="text-sm text-gray-500">プレビューはありません。</div>
			{/if}
		</div>

		<div class="mt-6 pt-6 border-t">
			<span class="block text-sm font-medium text-gray-700 mb-2">メディアを差し替える</span>
			<input
				type="file"
				accept={getAcceptType()}
				onchange={handleFileChange}
				class="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
			/>

			{#if uploadProgress > 0}
				<div class="mt-4 space-y-1">
					<div class="h-2 w-full rounded-full bg-gray-200">
						<div
							class="h-2 rounded-full bg-blue-600 transition-all"
							style="width: {uploadProgress}%"
						></div>
					</div>
					<p class="text-xs text-gray-500">アップロード中... {Math.round(uploadProgress)}%</p>
				</div>
			{/if}

			<button
				onclick={replaceMedia}
				disabled={isUpdating || !newMediaFile}
				class="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
			>
				{isUpdating && uploadProgress > 0 ? '差し替え中...' : '差し替えを実行'}
			</button>
		</div>
	</div>

	<!-- Delete Section -->
	<div class="bg-white rounded-lg shadow-sm p-6">
		<h3 class="text-lg font-semibold mb-2 text-red-600">テーマの削除</h3>
		<p class="text-sm text-gray-600 mb-4">
			この操作は元に戻せません。テーマを削除すると、関連するメディアファイルも孤立します。
		</p>
		<button
			onclick={deleteTheme}
			disabled={isUpdating}
			class="text-sm text-red-600 hover:underline disabled:opacity-50"
		>
			このテーマを完全に削除する
		</button>
	</div>
</div>
