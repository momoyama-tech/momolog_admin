<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, getCountFromServer } from 'firebase/firestore';
	import { onMount } from 'svelte';

	let groupCount = $state(0);
	let videoCount = $state(0);
	let userCount = $state(0);

	onMount(async () => {
		const [g, v, u] = await Promise.all([
			getCountFromServer(collection(db, 'groups')),
			getCountFromServer(collection(db, 'videos')),
			getCountFromServer(collection(db, 'users'))
		]);
		groupCount = g.data().count;
		videoCount = v.data().count;
		userCount = u.data().count;
	});
</script>

<h2 class="text-2xl font-bold mb-6">ダッシュボード</h2>
<div class="grid grid-cols-3 gap-6">
	<div class="bg-white p-6 rounded-lg shadow-sm">
		<p class="text-sm text-gray-500">団体数</p>
		<p class="text-3xl font-bold mt-1">{groupCount}</p>
	</div>
	<div class="bg-white p-6 rounded-lg shadow-sm">
		<p class="text-sm text-gray-500">動画数</p>
		<p class="text-3xl font-bold mt-1">{videoCount}</p>
	</div>
	<div class="bg-white p-6 rounded-lg shadow-sm">
		<p class="text-sm text-gray-500">ユーザー数</p>
		<p class="text-3xl font-bold mt-1">{userCount}</p>
	</div>
</div>
