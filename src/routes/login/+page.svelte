<script lang="ts">
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';
		try {
			await signInWithEmailAndPassword(auth, email, password);
			goto('/');
		} catch (e) {
			error = 'メールアドレスまたはパスワードが正しくありません';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
		<h1 class="text-2xl font-bold mb-6 text-center">momolog admin</h1>
		{#if error}
			<p class="text-red-500 text-sm mb-4">{error}</p>
		{/if}
		<div class="mb-4">
			<label for="email" class="block text-sm font-medium mb-1">メールアドレス</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				class="w-full border rounded px-3 py-2 text-sm"
				placeholder="admin@example.com"
			/>
		</div>
		<div class="mb-6">
			<label for="password" class="block text-sm font-medium mb-1">パスワード</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				class="w-full border rounded px-3 py-2 text-sm"
			/>
		</div>
		<button
			onclick={handleLogin}
			disabled={loading}
			class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
		>
			{loading ? 'ログイン中...' : 'ログイン'}
		</button>
	</div>
</div>
