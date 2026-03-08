<script lang="ts">
	import { signInWithPopup } from 'firebase/auth';
	import { auth, googleProvider } from '$lib/firebase';
	import { goto } from '$app/navigation';
	import { syncUserToFirestore } from '$lib/utils/user';

	let error = $state('');
	let loading = $state(false);

	async function handleGoogleLogin() {
		loading = true;
		error = '';
		try {
			const result = await signInWithPopup(auth, googleProvider);
			// ユーザー情報をFirestoreに保存
			await syncUserToFirestore(result.user);
			goto('/');
		} catch (e) {
			error = 'ログインに失敗しました。もう一度お試しください。';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
		<h1 class="text-2xl font-bold mb-2 text-center">momolog admin</h1>
		<p class="text-sm text-gray-500 text-center mb-8">運営者専用管理画面</p>
		{#if error}
			<p class="text-red-500 text-sm mb-4 text-center">{error}</p>
		{/if}
		<button
			onclick={handleGoogleLogin}
			disabled={loading}
			class="w-full flex items-center justify-center gap-3 border border-gray-300 rounded px-4 py-2 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
		>
			<svg width="18" height="18" viewBox="0 0 48 48">
				<path
					fill="#4285F4"
					d="M44.5 20H24v8.5h11.8C34.7 33.9 29.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
				/>
				<path
					fill="#34A853"
					d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.6 7.4 6.3 14.7z"
				/>
				<path
					fill="#FBBC05"
					d="M24 46c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.6 37.3 26.9 38 24 38c-5.1 0-9.4-3.1-11.4-7.5l-7 5.4C9.4 42.3 16.2 46 24 46z"
				/>
				<path
					fill="#EA4335"
					d="M44.5 20H24v8.5h11.8c-1 3-3.2 5.4-6.1 7l6.6 5.4C40.5 37.4 44 31.2 44 24c0-1.3-.2-2.7-.5-4z"
				/>
			</svg>
			{loading ? 'ログイン中...' : 'Googleアカウントでログイン'}
		</button>
	</div>
</div>
