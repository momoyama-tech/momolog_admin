<script lang="ts">
	import type { PageData } from './$types';
	import { db } from '$lib/firebase';
	import { doc, deleteDoc } from 'firebase/firestore';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	async function deleteGroup(id: string) {
		if (!confirm('この団体を削除しますか?')) return;
		await deleteDoc(doc(db, 'groups', id));
		await invalidateAll();
	}
</script>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-2xl font-bold">団体管理</h2>
</div>

<div class="bg-white rounded-lg shadow-sm overflow-hidden">
	<table class="w-full text-sm">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-4 py-3 font-medium text-gray-600">団体名</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">説明</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">YouTube連携</th>
				<th class="px-4 py-3"></th>
			</tr>
		</thead>
		<tbody>
			{#each data.groups as group}
				<tr class="border-b hover:bg-gray-50">
					<td class="px-4 py-3">
						<a href="/groups/{group.id}" class="text-blue-600 hover:underline">{group.name}</a>
					</td>
					<td class="px-4 py-3 text-gray-600">{group.description}</td>
					<td class="px-4 py-3">
						{#if group.youtube?.connected}
							<span class="text-green-600">連携済み</span>
						{:else}
							<span class="text-gray-400">未連携</span>
						{/if}
					</td>
					<td class="px-4 py-3 text-right">
						<button
							onclick={() => deleteGroup(group.id)}
							class="text-red-500 hover:underline text-xs"
						>
							削除
						</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="px-4 py-6 text-center text-gray-400">団体がありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
