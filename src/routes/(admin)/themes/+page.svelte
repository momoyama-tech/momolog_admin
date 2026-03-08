<script lang="ts">
	import type { PageData } from './$types';
	import type { ThemeType } from '$lib/types';

	let { data } = $props<{ data: PageData }>();

	const themeTypeLabels: Record<ThemeType, string> = {
		bgm: 'BGM',
		chromakey: 'クロマキー'
	};

	const themeTypeBadgeColors: Record<ThemeType, string> = {
		bgm: 'bg-blue-100 text-blue-700',
		chromakey: 'bg-green-100 text-green-700'
	};
</script>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-2xl font-bold">テーマ管理</h2>
	<a
		href="/themes/new"
		class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
	>
		+ 新規テーマ
	</a>
</div>

<div class="bg-white rounded-lg shadow-sm overflow-x-auto">
	<table class="w-full text-sm min-w-[600px]">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-6 py-3 font-medium text-gray-600">テーマ名</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">タイプ</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">説明</th>
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
					<td colspan="4" class="px-6 py-10 text-center text-gray-400">テーマがありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
