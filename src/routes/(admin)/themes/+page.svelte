<script lang="ts">
	import type { PageData } from './$types';
	import type { ThemeType } from '$lib/types';
	import { db, storage } from '$lib/firebase';
	import { doc, deleteDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
	import { invalidateAll } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';

	let { data } = $props<{ data: PageData }>();

	let showForm = $state(false);
	let name = $state('');
	let description = $state('');
	let themeType = $state<ThemeType>('bgm');
	let mediaFile = $state<File | null>(null);
	let saving = $state(false);
	let uploadProgress = $state(0);

	const themeTypeLabels: Record<ThemeType, string> = {
		bgm: 'BGM',
		chromakey: 'クロマキー'
	};

	const themeTypeBadgeColors: Record<ThemeType, string> = {
		bgm: 'bg-blue-100 text-blue-700',
		chromakey: 'bg-green-100 text-green-700'
	};

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

	async function uploadFileToStorage(file: File, path: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const storageRef = ref(storage, path);
			const uploadTask = uploadBytesResumable(storageRef, file);
			uploadTask.on(
				'state_changed',
				(snapshot) => {
					uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				},
				(error) => reject(error),
				async () => {
					const url = await getDownloadURL(uploadTask.snapshot.ref);
					resolve(url);
				}
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

			name = '';
			description = '';
			mediaFile = null;
			showForm = false;
			await invalidateAll();
		} catch (e) {
			alert('テーマの作成に失敗しました: ' + (e as Error).message);
		} finally {
			saving = false;
		}
	}

	async function toggleActive(themeId: string, currentActive: boolean) {
		await updateDoc(doc(db, 'themes', themeId), {
			active: !currentActive,
			updatedAt: serverTimestamp()
		});
		await invalidateAll();
	}

	async function deleteTheme(id: string) {
		if (!confirm('このテーマを削除しますか?')) return;
		await deleteDoc(doc(db, 'themes', id));
		await invalidateAll();
	}
</script>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-2xl font-bold">テーマ管理</h2>
	<button
		onclick={() => (showForm = !showForm)}
		class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
	>
		{showForm ? 'キャンセル' : '+ 新規テーマ'}
	</button>
</div>

{#if showForm}
	<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
		<h3 class="font-semibold mb-4">新規テーマ作成</h3>
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
				<label for="theme-name" class="block text-sm font-medium text-gray-700 mb-1"
					>テーマ名</label
				>
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

			<button
				type="submit"
				disabled={saving || !name.trim() || !mediaFile}
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
			>
				{saving ? '作成中...' : '作成'}
			</button>
		</form>
	</div>
{/if}

<div class="bg-white rounded-lg shadow-sm overflow-hidden">
	<table class="w-full text-sm">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-4 py-3 font-medium text-gray-600">テーマ名</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">タイプ</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">説明</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">状態</th>
				<th class="px-4 py-3"></th>
			</tr>
		</thead>
		<tbody>
			{#each data.themes as theme}
				<tr class="border-b hover:bg-gray-50">
					<td class="px-4 py-3 font-medium">{theme.name}</td>
					<td class="px-4 py-3">
						<span class="px-2 py-0.5 rounded text-xs font-medium {themeTypeBadgeColors[theme.type]}">
							{themeTypeLabels[theme.type]}
						</span>
					</td>
					<td class="px-4 py-3 text-gray-600">{theme.description}</td>
					<td class="px-4 py-3">
						<button
							onclick={() => toggleActive(theme.id, theme.active)}
							class="text-xs px-2 py-1 rounded {theme.active
								? 'bg-green-100 text-green-700'
								: 'bg-gray-100 text-gray-500'}"
						>
							{theme.active ? '有効' : '無効'}
						</button>
					</td>
					<td class="px-4 py-3 text-right">
						<button
							onclick={() => deleteTheme(theme.id)}
							class="text-red-500 hover:underline text-xs"
						>
							削除
						</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-4 py-6 text-center text-gray-400">テーマがありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
