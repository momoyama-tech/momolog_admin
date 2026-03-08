<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, getCountFromServer } from 'firebase/firestore';
	import { onMount } from 'svelte';

	let groupCount = $state(0);
	let videoCount = $state(0);
	let userCount = $state(0);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const [g, v, u] = await Promise.all([
				getCountFromServer(collection(db, 'groups')),
				getCountFromServer(collection(db, 'videos')),
				getCountFromServer(collection(db, 'users'))
			]);
			groupCount = g.data().count;
			videoCount = v.data().count;
			userCount = u.data().count;
		} catch (e: any) {
			console.error('データ取得エラー:', e);
			error = e.message || 'データの取得に失敗しました';
		} finally {
			loading = false;
		}
	});
</script>

<h2 class="text-2xl font-bold mb-6">ダッシュボード</h2>

{#if error}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
		<p class="text-red-800 text-sm">
			<strong>エラー:</strong>
			{error}
		</p>
		<p class="text-red-600 text-xs mt-2">
			ブラウザのコンソール（F12）でエラー詳細を確認してください。
		</p>
	</div>
{/if}

{#if loading}
	<div class="text-center py-12 text-gray-500">読み込み中...</div>
{:else}
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
		<a href="/groups" class="block bg-white p-6 rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
			<p class="text-sm text-gray-500">団体数</p>
			<p class="text-3xl font-bold mt-1">{groupCount}</p>
		</a>
		<a href="/videos" class="block bg-white p-6 rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
			<p class="text-sm text-gray-500">動画数</p>
			<p class="text-3xl font-bold mt-1">{videoCount}</p>
		</a>
		<a href="/users" class="block bg-white p-6 rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
			<p class="text-sm text-gray-500">ユーザー数</p>
			<p class="text-3xl font-bold mt-1">{userCount}</p>
		</a>
	</div>

	{#if groupCount === 0 && videoCount === 0 && userCount === 0}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
			<p class="text-blue-800 text-sm font-medium mb-2">データがまだありません</p>
			<p class="text-blue-700 text-sm">
				テストデータを作成するには、<a href="/groups/new" class="underline">団体を作成</a
				>してください。
			</p>
		</div>
	{/if}
{/if}
