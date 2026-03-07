<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser, authLoading } from '$lib/stores/auth';
	import '../app.css';

	let { children } = $props();

	// 未認証の場合はログインページへリダイレクト
	$effect(() => {
		if (!$authLoading && !$currentUser && $page.url.pathname !== '/login') {
			goto('/login');
		}
	});
</script>

{#if $authLoading}
	<div class="flex items-center justify-center h-screen">
		<p class="text-gray-500">読み込み中...</p>
	</div>
{:else}
	{@render children()}
{/if}
