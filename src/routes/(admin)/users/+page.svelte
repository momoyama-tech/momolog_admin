<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<h2 class="text-2xl font-bold mb-6">ユーザー管理</h2>

<div class="bg-white rounded-lg shadow-sm overflow-hidden">
	<table class="w-full text-sm">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-4 py-3 font-medium text-gray-600">ユーザーID</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">所属団体</th>
				<th class="text-left px-4 py-3 font-medium text-gray-600">権限</th>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user}
				<tr class="border-b hover:bg-gray-50">
					<td class="px-4 py-3 font-mono text-xs">{user.id}</td>
					<td class="px-4 py-3 text-gray-600">
						{user.groupIds?.length ? user.groupIds.join(', ') : '未所属'}
					</td>
					<td class="px-4 py-3">
						<span
							class={user.role === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-600'}
						>
							{user.role ?? 'user'}
						</span>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="3" class="px-4 py-6 text-center text-gray-400">ユーザーがありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
