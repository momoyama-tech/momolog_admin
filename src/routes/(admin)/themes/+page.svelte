<script lang="ts">
	import { db, storage } from '$lib/firebase';
	import { doc, updateDoc } from 'firebase/firestore';
	import { ref, getDownloadURL } from 'firebase/storage';
	import type { PageData } from './$types';
	import type { Theme, ThemeType } from '$lib/types';

	let { data } = $props<{ data: PageData }>();

	let updatingDurations = $state(false);
	let updateMessage = $state('');

	const themeTypeLabels: Record<ThemeType, string> = {
		bgm: 'BGM',
		chromakey: 'クロマキー'
	};

	const themeTypeBadgeColors: Record<ThemeType, string> = {
		bgm: 'bg-blue-100 text-blue-700',
		chromakey: 'bg-green-100 text-green-700'
	};

	function formatDuration(seconds: number): string {
		if (!seconds) return '-';
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return m > 0 ? `${m}分${s.toString().padStart(2, '0')}秒` : `${s}秒`;
	}

	function getMediaDuration(url: string, type: ThemeType): Promise<number> {
		return new Promise((resolve) => {
			const el = type === 'bgm' ? new Audio() : document.createElement('video');
			el.preload = 'metadata';
			el.onloadedmetadata = () => {
				resolve(Math.round(el.duration));
			};
			el.onerror = () => resolve(0);
			el.src = url;
		});
	}

	async function updateAllDurations() {
		updatingDurations = true;
		updateMessage = '';
		let updated = 0;

		try {
			const targets = data.themes.filter(
				(t: Theme) => t.mediaStoragePath && !t.mediaDuration
			);

			if (targets.length === 0) {
				updateMessage = 'すべてのテーマに再生時間が設定済みです';
				updatingDurations = false;
				return;
			}

			updateMessage = `${targets.length}件のテーマを処理中...`;

			for (const theme of targets) {
				try {
					const url = await getDownloadURL(ref(storage, theme.mediaStoragePath));
					const duration = await getMediaDuration(url, theme.type);
					if (duration > 0) {
						await updateDoc(doc(db, 'themes', theme.id), { mediaDuration: duration });
						theme.mediaDuration = duration;
						updated++;
					}
				} catch (e) {
					console.warn(`Failed to get duration for ${theme.name}:`, e);
				}
			}

			updateMessage = `${updated}件の再生時間を更新しました`;
		} catch (e) {
			updateMessage = 'エラーが発生しました';
		} finally {
			updatingDurations = false;
		}
	}
</script>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-2xl font-bold">テーマ管理</h2>
	<div class="flex items-center gap-3">
		<button
			onclick={updateAllDurations}
			disabled={updatingDurations}
			class="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm disabled:opacity-50"
		>
			{updatingDurations ? '更新中...' : '再生時間を一括更新'}
		</button>
		<a
			href="/themes/new"
			class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
		>
			+ 新規テーマ
		</a>
	</div>
</div>

{#if updateMessage}
	<div class="mb-4 rounded bg-blue-50 px-4 py-2 text-sm text-blue-700">{updateMessage}</div>
{/if}

<div class="bg-white rounded-lg shadow-sm overflow-x-auto">
	<table class="w-full text-sm min-w-[600px]">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-6 py-3 font-medium text-gray-600">テーマ名</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">タイプ</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">説明</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">再生時間</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">状態</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200">
			{#each data.themes as theme}
				<tr class="hover:bg-gray-50">
					<td class="px-6 py-4 font-medium">
						<a href="/themes/{theme.id}" class="text-blue-600 hover:underline">{theme.name}</a>
					</td>
					<td class="px-6 py-4">
						<span
							class="px-2 py-1 rounded-full text-xs font-medium {themeTypeBadgeColors[
								theme.type
							]}"
						>
							{themeTypeLabels[theme.type]}
						</span>
					</td>
					<td class="px-6 py-4 text-gray-600">{theme.description}</td>
					<td class="px-6 py-4 text-gray-600">{formatDuration(theme.mediaDuration ?? 0)}</td>
					<td class="px-6 py-4">
						<span
							class="text-xs px-2 py-1 rounded-full font-medium {theme.active
								? 'bg-green-100 text-green-700'
								: 'bg-gray-100 text-gray-600'}"
						>
							{theme.active ? '有効' : '無効'}
						</span>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-6 py-10 text-center text-gray-400">テーマがありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
