<script lang="ts">
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let success = $state('');
	let loading = $state(false);

	async function handleSignup() {
		loading = true;
		error = '';
		success = '';
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			success = 'ユーザーを作成しました。ログインページに移動します...';
			setTimeout(() => {
				goto('/login');
			}, 2000);
		} catch (e: any) {
			if (e.code === 'auth/email-already-in-use') {
				error = 'このメールアドレスは既に使用されています';
			} else if (e.code === 'auth/weak-password') {
				error = 'パスワードは6文字以上で設定してください';
			} else if (e.code === 'auth/invalid-email') {
				error = '有効なメールアドレスを入力してください';
			} else {
				error = 'ユーザーの作成に失敗しました: ' + e.message;
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
		<h1 class="text-2xl font-bold mb-2 text-center">テストユーザー登録</h1>
		<p class="text-sm text-gray-500 mb-6 text-center">開発環境用</p>

		{#if error}
			<p class="text-red-500 text-sm mb-4">{error}</p>
		{/if}
		{#if success}
			<p class="text-green-600 text-sm mb-4">{success}</p>
		{/if}

		<div class="mb-4">
			<label for="email" class="block text-sm font-medium mb-1">メールアドレス</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				class="w-full border rounded px-3 py-2 text-sm"
				placeholder="test@example.com"
			/>
		</div>
		<div class="mb-6">
			<label for="password" class="block text-sm font-medium mb-1"
				>パスワード (6文字以上)</label
			>
			<input
				id="password"
				type="password"
				bind:value={password}
				class="w-full border rounded px-3 py-2 text-sm"
			/>
		</div>
		<button
			onclick={handleSignup}
			disabled={loading}
			class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 mb-3"
		>
			{loading ? '作成中...' : 'ユーザーを作成'}
		</button>
		<a href="/login" class="block text-center text-sm text-blue-600 hover:underline">
			ログインページに戻る
		</a>
	</div>
</div>
