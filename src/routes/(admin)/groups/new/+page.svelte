<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';

	let name = $state('');
	let description = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		if (!name.trim()) {
			error = '団体名を入力してください';
			return;
		}
		loading = true;
		try {
			await addDoc(collection(db, 'groups'), {
				name,
				description,
				createdBy: $currentUser?.uid ?? '',
				createdAt: serverTimestamp()
			});
			goto('/groups');
		} catch (e) {
			error = '作成に失敗しました';
		} finally {
			loading = false;
		}
	}
</script>

<h2 class="text-2xl font-bold mb-6">団体を新規作成</h2>
<div class="bg-white p-6 rounded-lg shadow-sm max-w-lg">
	{#if error}<p class="text-red-500 text-sm mb-4">{error}</p>{/if}
	<div class="mb-4">
		<label for="name" class="block text-sm font-medium mb-1">団体名 *</label>
		<input id="name" bind:value={name} class="w-full border rounded px-3 py-2 text-sm" />
	</div>
	<div class="mb-6">
		<label for="description" class="block text-sm font-medium mb-1">説明</label>
		<textarea
			id="description"
			bind:value={description}
			rows="3"
			class="w-full border rounded px-3 py-2 text-sm"
		></textarea>
	</div>
	<div class="flex gap-3">
		<button
			onclick={handleSubmit}
			disabled={loading}
			class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
		>
			{loading ? '作成中...' : '作成する'}
		</button>
		<a href="/groups" class="px-4 py-2 text-sm text-gray-600 hover:underline">キャンセル</a>
	</div>
</div>
