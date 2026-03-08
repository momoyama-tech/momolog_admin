<script lang="ts">
	import type { ThemeType } from '$lib/types';
	import { db, storage } from '$lib/firebase';
	import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
	import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';

	let name = $state('');
	let description = $state('');
	let themeType = $state<ThemeType>('bgm');
	let mediaFile = $state<File | null>(null);
	let saving = $state(false);
	let uploadProgress = $state(0);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) mediaFile = file;
	}

	function getAcceptType(): string {
		return themeType === 'bgm' ? 'audio/*' : 'video/*';
	}

	function getFileExtension(): string {
		if (!mediaFile) return '';
		const name = mediaFile.name;
		const idx = name.lastIndexOf('.');
		return idx >= 0 ? name.substring(idx) : '';
	}

	async function uploadFileToStorage(file: File, path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const storageRef = ref(storage, path);
			const uploadTask = uploadBytesResumable(storageRef, file);
			uploadTask.on(
				'state_changed',
				(snapshot) => {
					uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				},
				(error) => reject(error),
				() => resolve()
			);
		});
	}

	async function createTheme() {
		if (!name.trim() || !mediaFile || !$currentUser) return;

		saving = true;
		uploadProgress = 0;

		try {
			const docRef = await addDoc(collection(db, 'themes'), {
				name: name.trim(),
				description: description.trim(),
				type: themeType,
				mediaStoragePath: '',
				active: true,
				createdBy: $currentUser.uid,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});

			const ext = getFileExtension();
			const storagePath = `themes/${docRef.id}/media${ext}`;
			await uploadFileToStorage(mediaFile, storagePath);

			await updateDoc(doc(db, 'themes', docRef.id), {
				mediaStoragePath: storagePath,
				updatedAt: serverTimestamp()
			});

			goto('/themes');
		} catch (e) {
			alert('テーマの作成に失敗しました: ' + (e as Error).message);
		} finally {
			saving = false;
		}
	}
</script>

<div class="mb-6">
	<a href="/themes" class="text-sm text-blue-600 hover:underline">← テーマ一覧に戻る</a>
</div>

<h2 class="text-2xl font-bold mb-6">新規テーマ作成</h2>

<div class="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			createTheme();
		}}
		class="space-y-4"
	>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-1">タイプ</label>
			<div class="flex gap-3">
				<label class="flex items-center gap-2">
					<input type="radio" bind:group={themeType} value="bgm" />
					<span class="text-sm">BGM</span>
				</label>
				<label class="flex items-center gap-2">
					<input type="radio" bind:group={themeType} value="chromakey" />
					<span class="text-sm">クロマキー（背景動画）</span>
				</label>
			</div>
		</div>

		<div>
			<label for="theme-name" class="block text-sm font-medium text-gray-700 mb-1">テーマ名</label>
			<input
				id="theme-name"
				type="text"
				bind:value={name}
				placeholder="例: ポップBGM"
				class="w-full border rounded px-3 py-2 text-sm"
				required
			/>
		</div>

		<div>
			<label for="theme-desc" class="block text-sm font-medium text-gray-700 mb-1">説明</label>
			<input
				id="theme-desc"
				type="text"
				bind:value={description}
				placeholder="例: 明るいポップな雰囲気のBGM"
				class="w-full border rounded px-3 py-2 text-sm"
			/>
		</div>

		<div>
			<label for="theme-media" class="block text-sm font-medium text-gray-700 mb-1">
				{themeType === 'bgm' ? '音楽ファイル' : '背景動画ファイル'}
			</label>
			<input
				id="theme-media"
				type="file"
				accept={getAcceptType()}
				onchange={handleFileChange}
				class="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
				required
			/>
		</div>

		{#if saving}
			<div class="space-y-1">
				<div class="h-2 w-full rounded-full bg-gray-200">
					<div
						class="h-2 rounded-full bg-blue-600 transition-all"
						style="width: {uploadProgress}%"
					></div>
				</div>
				<p class="text-xs text-gray-500">アップロード中... {Math.round(uploadProgress)}%</p>
			</div>
		{/if}

		<div class="flex gap-4">
			<button
				type="submit"
				disabled={saving || !name.trim() || !mediaFile}
				class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
			>
				{saving ? '作成中...' : '作成'}
			</button>
			<a href="/themes" class="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
				キャンセル
			</a>
		</div>
	</form>
</div>
