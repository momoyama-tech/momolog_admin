<script lang="ts">
	import type { PageData } from './$types';
	import type { UserRole } from '$lib/types';
	import { db } from '$lib/firebase';
	import { doc, updateDoc, getDoc } from 'firebase/firestore';
	import { invalidateAll } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { data } = $props<{ data: PageData }>();

	let currentUserRole = $state<UserRole>('user');
	let loadingRole = $state(true);

	const roleLabels: Record<UserRole, string> = {
		user: '一般ユーザー',
		admin: '管理者',
		superadmin: 'スーパー管理者'
	};

	const roleColors: Record<UserRole, string> = {
		user: 'text-gray-600',
		admin: 'text-blue-600',
		superadmin: 'text-purple-600'
	};

	onMount(async () => {
		if ($currentUser) {
			try {
				const userDoc = await getDoc(doc(db, 'users', $currentUser.uid));
				if (userDoc.exists()) {
					currentUserRole = userDoc.data()?.role || 'user';
				}
			} catch (error) {
				console.error('ユーザー情報取得エラー:', error);
			} finally {
				loadingRole = false;
			}
		}
	});

	async function updateUserRole(userId: string, newRole: UserRole) {
		if (currentUserRole !== 'superadmin') {
			alert(
				'権限の変更には「スーパー管理者」権限が必要です。\n\n現在のあなたの権限: ' +
					roleLabels[currentUserRole]
			);
			return;
		}

		if (
			!confirm(
				`このユーザーの権限を「${roleLabels[newRole]}」に変更しますか？\n\n※変更後、ユーザーは再ログインが必要な場合があります。`
			)
		) {
			return;
		}

		try {
			await updateDoc(doc(db, 'users', userId), {
				role: newRole
			});
			await invalidateAll();
			alert('権限を変更しました');
		} catch (error: any) {
			console.error('権限変更エラー:', error);
			alert(
				'権限の変更に失敗しました。\n\nエラー: ' +
					error.message +
					'\n\n※Firestoreのセキュリティルールをデプロイしてください。'
			);
		}
	}
</script>

<div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
	<h2 class="text-2xl font-bold self-start sm:self-center">ユーザー管理</h2>
	{#if !loadingRole}
		<div class="text-sm self-end sm:self-center">
			<span class="text-gray-500">あなたの権限:</span>
			<span class="ml-2 px-3 py-1 rounded-full bg-gray-100 {roleColors[currentUserRole]} font-medium">
				{roleLabels[currentUserRole]}
			</span>
		</div>
	{/if}
</div>

{#if currentUserRole !== 'superadmin'}
	<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
		<p class="text-yellow-800 text-sm">
			<strong>⚠️ 注意:</strong>
			権限を変更するには「スーパー管理者」権限が必要です。
		</p>
		<p class="text-yellow-700 text-xs mt-2">
			Firebaseコンソールから
			<code class="bg-yellow-100 px-1 rounded">users/{$currentUser?.uid}</code> の
			<code class="bg-yellow-100 px-1 rounded">role</code> フィールドを
			<code class="bg-yellow-100 px-1 rounded">superadmin</code> に変更してください。
		</p>
	</div>
{/if}

<div class="bg-white rounded-lg shadow-sm overflow-x-auto">
	<table class="w-full text-sm min-w-[600px]">
		<thead class="bg-gray-50 border-b">
			<tr>
				<th class="text-left px-6 py-3 font-medium text-gray-600">ユーザー名</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">メールアドレス</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">所属団体</th>
				<th class="text-left px-6 py-3 font-medium text-gray-600">権限</th>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user}
				<tr class="border-b hover:bg-gray-50">
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="flex items-center gap-3">
							{#if user.photoURL}
								<img
									src={user.photoURL}
									alt={user.displayName}
									class="w-9 h-9 rounded-full"
								/>
							{:else}
								<div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
									<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
								</div>
							{/if}
							<span class="font-medium">{user.displayName || 'Unknown'}</span>
						</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-gray-600">{user.email || '—'}</td>
					<td class="px-6 py-4 whitespace-nowrap text-gray-600">
						{user.groupIds?.length ? user.groupIds.join(', ') : '未所属'}
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<select
							value={user.role ?? 'user'}
							onchange={(e) => updateUserRole(user.id, e.currentTarget.value as UserRole)}
							disabled={currentUserRole !== 'superadmin'}
							class="border rounded px-2 py-1 text-sm {roleColors[user.role ?? 'user']} font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white"
						>
							{#each Object.entries(roleLabels) as [roleValue, roleLabel]}
								<option value={roleValue}>{roleLabel}</option>
							{/each}
						</select>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="px-6 py-10 text-center text-gray-400">ユーザーがありません</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
