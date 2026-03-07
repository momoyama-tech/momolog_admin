<script lang="ts">
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/auth';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'ダッシュボード' },
		{ href: '/groups', label: '団体管理' },
		{ href: '/videos', label: '動画一覧' },
		{ href: '/users', label: 'ユーザー管理' }
	];

	async function logout() {
		await signOut(auth);
		goto('/login');
	}
</script>

{#if $currentUser}
	<div class="flex h-screen bg-gray-100">
		<aside class="w-56 bg-white border-r flex flex-col">
			<div class="p-4 border-b">
				<h1 class="font-bold text-lg">momolog admin</h1>
			</div>
			<nav class="flex-1 p-4 space-y-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="block px-3 py-2 rounded text-sm hover:bg-gray-100
              {$page.url.pathname === item.href ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="p-4 border-t">
				<p class="text-xs text-gray-500 mb-2 truncate">{$currentUser.email}</p>
				<button onclick={logout} class="text-sm text-red-500 hover:underline">
					ログアウト
				</button>
			</div>
		</aside>
		<main class="flex-1 overflow-y-auto p-8">
			{@render children()}
		</main>
	</div>
{/if}
