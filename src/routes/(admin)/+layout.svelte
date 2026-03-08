<script lang="ts">
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/auth';

	let { children } = $props();

	let isMenuOpen = $state(false);

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

	// Close menu on navigation
	$effect(() => {
		if ($page.url.pathname) {
			isMenuOpen = false;
		}
	});
</script>

{#if $currentUser}
	<div class="min-h-screen bg-gray-100 md:flex md:h-screen">
		<!-- Mobile menu overlay -->
		{#if isMenuOpen}
			<div
				role="presentation"
				class="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
				onclick={() => (isMenuOpen = false)}
			></div>
		{/if}

		<!-- Sidebar -->
		<aside
			class="fixed top-0 left-0 h-full w-64 bg-white border-r flex flex-col z-30
           transform transition-transform duration-300 ease-in-out
           md:relative md:translate-x-0 md:w-56
           {isMenuOpen ? 'translate-x-0' : '-translate-x-full'}"
		>
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
				<p class="text-xs text-gray-500 mb-2 truncate" title={$currentUser.email ?? ''}>
					{$currentUser.email}
				</p>
				<button onclick={logout} class="text-sm text-red-500 hover:underline">
					ログアウト
				</button>
			</div>
		</aside>

		<!-- Content Area -->
		<div class="flex flex-col flex-1 md:overflow-y-auto">
			<!-- Mobile Header -->
			<header
				class="flex md:hidden justify-between items-center p-4 bg-white border-b sticky top-0 z-10"
			>
				<button onclick={() => (isMenuOpen = !isMenuOpen)} class="text-gray-600">
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16m-7 6h7"
						></path></svg
					>
				</button>
				<h1 class="font-bold text-lg">
					{navItems.find((item) => item.href === $page.url.pathname)?.label ?? 'ダッシュボード'}
				</h1>
				<div class="w-6"></div>
				<!-- Placeholder for spacing -->
			</header>

			<!-- Main Content -->
			<main class="flex-1 p-4 sm:p-6 md:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
