# momolog_admin

momologプロジェクトの運営者向け管理画面です。団体の管理・ユーザー管理・動画の横断管理など、サービス全体の運営作業を担います。

- **担当者**: ゆーき
- **GitHub**: https://github.com/momoyama-tech/momolog_admin
- **Firebase (開発環境)**: https://console.firebase.google.com/u/0/project/momolog-develop/overview
- **Firebase (本番環境)**: https://console.firebase.google.com/u/0/project/momolog-production/overview

---

## 目次

1. [プロジェクト全体像](#プロジェクト全体像)
2. [このリポジトリの責務](#このリポジトリの責務)
3. [技術スタック](#技術スタック)
4. [リポジトリ構成](#リポジトリ構成)
5. [セットアップ手順](#セットアップ手順)
6. [環境変数](#環境変数)
7. [画面一覧](#画面一覧)
8. [Firestoreデータ設計](#firestoreデータ設計)
9. [各ファイルのコード](#各ファイルのコード)
10. [開発ルール](#開発ルール)

---

## プロジェクト全体像

momologは団体の動画を管理・公開するサービスです。リポジトリは3つに分かれています。

| リポジトリ | 概要 |
|---|---|
| momolog_system | 団体ユーザーが動画を撮影・加工・YouTubeへ投稿するアプリ |
| **momolog_admin** | **運営者が団体・ユーザー・動画を管理する管理画面（このリポジトリ）** |
| momolog_official | 一般ユーザーが団体別に動画を閲覧する公開サイト |

### システム全体フロー

```
[ログイン（Firebase Auth / Google Sign-In）]
    ↓
[団体作成 or 参加（momolog_system）]
    ↓
[団体のYouTubeアカウントをOAuth 2.0で連携（1回のみ）]
    ↓
[動画撮影・加工 → メタデータ入力 → 団体選択]
    ↓
[Firebase Storage に動画を一時保存]
    ↓
[SvelteKit APIがYouTube Data API v3で自動投稿 ※ 非公開（private）]
    ↓
[YouTube URL を Firestore に保存（団体IDと紐付け）]
    ↓
[YouTube側で運営が手動で公開設定を変更]       ← admin で動画の状態を確認
    ↓
[momolog_official が Firestore から団体別に動画取得・表示]
```

> ⚠️ **YouTube公開設定はadminから変更しない**
> YouTubeの公開・限定公開への変更はYouTubeスタジオ側で運営が手動で行う。

---

## このリポジトリの責務

- 運営者認証（Firebase Authentication）
- 団体（グループ）の新規作成・編集・削除・権限管理
- ユーザーの団体所属管理
- 全団体を横断した動画の一覧確認・ステータス管理

**adminが行わないこと:**

- 動画のYouTube公開設定の変更（YouTubeスタジオで運営が手動対応）

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | SvelteKit |
| スタイリング | Tailwind CSS |
| 認証 | Firebase Authentication |
| DB | Firebase Firestore |
| ホスティング | Vercel / Firebase Hosting（検討中） |

---

## リポジトリ構成

```
momolog_admin/
├── .env                          # 環境変数（git管理外）
├── .env.example                  # 環境変数のテンプレート（必ずコミット）
├── .gitignore
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── app.html                  # HTMLエントリーポイント
│   ├── app.css                   # Tailwindのベーススタイル
│   ├── lib/
│   │   ├── firebase.ts           # Firebase初期化（Auth・Firestore）
│   │   ├── types.ts              # 型定義（Group / AppUser / Video）
│   │   └── stores/
│   │       └── auth.ts           # 認証状態のSvelteストア
│   └── routes/
│       ├── +layout.ts            # SSR無効化設定
│       ├── +layout.svelte        # 全体レイアウト（未認証時リダイレクト）
│       ├── login/
│       │   └── +page.svelte      # ログイン画面
│       └── (admin)/              # 認証済みルートグループ
│           ├── +layout.svelte    # サイドバー・ナビゲーション
│           ├── +page.svelte      # ダッシュボード（件数サマリー）
│           ├── groups/
│           │   ├── +page.svelte          # 団体一覧
│           │   ├── +page.ts
│           │   ├── new/
│           │   │   └── +page.svelte      # 団体新規作成
│           │   └── [groupId]/
│           │       ├── +page.svelte      # 団体詳細（所属ユーザー・動画）
│           │       └── +page.ts
│           ├── videos/
│           │   ├── +page.svelte          # 動画一覧（全団体横断）
│           │   ├── +page.ts
│           │   └── [videoId]/
│           │       ├── +page.svelte      # 動画詳細・メタデータ編集
│           │       └── +page.ts
│           └── users/
│               ├── +page.svelte          # ユーザー管理
│               └── +page.ts
```

---

## セットアップ手順

### 1. クローン済みディレクトリでSvelteKitを初期化

```bash
cd momolog_admin

npm create svelte@latest .
```

対話式プロンプトでは以下を選択：

```
◆ Which Svelte app template?
  → Skeleton project

◆ Add type checking with TypeScript?
  → Yes, using TypeScript syntax

◆ Select additional options:
  → Add ESLint for code linting
  → Add Prettier for code formatting
```

### 2. 依存関係をインストール

```bash
npm install
npm install firebase
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Tailwindの設定

`tailwind.config.js` を以下に書き換え：

```js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: []
};
```

`src/app.css` を作成（または上書き）：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. 環境変数を設定

```bash
cp .env.example .env
# .env にFirebaseの値を記入（次のセクション参照）
```

### 5. 以下の「各ファイルのコード」セクションを参照してファイルを作成

### 6. 開発サーバーを起動

```bash
npm run dev
# → http://localhost:5173 でログイン画面が表示されればOK
```

### 7. テストユーザーを作成

開発サーバーを起動した状態で、以下のいずれかの方法でテストユーザーを作成します：

**方法1: サインアップページから作成（推奨）**

1. http://localhost:5173/signup にアクセス
2. メールアドレスとパスワード（6文字以上）を入力
3. 「ユーザーを作成」ボタンをクリック
4. 自動的にログインページにリダイレクトされます

**方法2: Firebaseコンソールから作成**

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. Authentication → Users → Add user
4. メールアドレスとパスワードを入力して作成

### 8. 初回コミット

```bash
git add .
git commit -m "feat: initial SvelteKit setup with Firebase Auth"
git push origin main
```

---

## 環境変数

`.env.example` として以下をリポジトリに含めること（実際の値はコミットしない）。

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

Firebaseコンソール → プロジェクト設定 → マイアプリ からコピーして `.env` に記入する。

> ⚠️ `.env` は必ず `.gitignore` に含めること。
> ```bash
> echo ".env" >> .gitignore
> ```

---

## 画面一覧

| パス | 画面名 | 概要 |
|---|---|---|
| `/login` | ログイン画面 | 運営者のみアクセス可（Firebase Auth） |
| `/` | ダッシュボード | 団体数・動画数・ユーザー数のサマリー |
| `/groups` | 団体一覧・管理 | 団体の一覧表示・編集・削除 |
| `/groups/new` | 団体新規作成 | 団体名・説明の入力フォーム |
| `/groups/[groupId]` | 団体詳細 | 所属ユーザー一覧・所属動画一覧 |
| `/videos` | 動画一覧（横断） | 全団体の動画をステータスでフィルタ可 |
| `/videos/[videoId]` | 動画詳細 | メタデータ確認・official表示切替 |
| `/users` | ユーザー管理 | ユーザーの団体所属変更・権限管理 |

---

## Firestoreデータ設計

systemリポジトリと共有するコレクション構成です。

```
/groups/{groupId}
  - name: string                  // 団体名
  - description: string           // 団体説明
  - createdBy: string             // 作成者UID
  - createdAt: timestamp
  - youtube: {                    // YouTube連携情報（systemが管理）
      channelId: string,
      channelTitle: string,
      connected: boolean,
      connectedAt: timestamp
    }

/users/{userId}
  - groupIds: string[]            // 所属団体IDの配列（複数団体所属可）
  - role: "user" | "admin"        // 将来実装予定

/videos/{videoId}
  - groupId: string               // 所属団体ID
  - uploadedBy: string            // 投稿者UID
  - title: string
  - description: string
  - tags: string[]
  - status: 'pending'             // 投稿待ち
           | 'uploading_to_youtube' // YouTube投稿中
           | 'published'          // 投稿完了
           | 'failed'             // 投稿失敗
           | 'rejected'           // 却下
  - storagePath: string           // Firebase Storage パス
  - storageUrl: string            // Firebase Storage URL
  - youtubeUrl: string            // YouTube動画URL
  - youtubeVideoId: string        // YouTube動画ID
  - youtubeError: string          // エラー内容（failedの場合）
  - createdAt: timestamp

/youtube_credentials/{groupId}    // ⚠️ adminからは参照不可（サーバー専用）
  - refreshToken, accessToken, tokenExpiry, scope, updatedAt
```

---

## 各ファイルのコード

### `src/app.html`

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

---

### `src/lib/firebase.ts`

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

### `src/lib/types.ts`

```ts
export type VideoStatus =
  | 'pending'
  | 'uploading_to_youtube'
  | 'published'
  | 'failed'
  | 'rejected';

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  youtube?: {
    channelId: string;
    channelTitle: string;
    connected: boolean;
    connectedAt: Date;
  };
}

export interface AppUser {
  id: string;
  groupIds: string[];
  role: 'user' | 'admin';
}

export interface Video {
  id: string;
  groupId: string;
  uploadedBy: string;
  title: string;
  description: string;
  tags: string[];
  status: VideoStatus;
  storagePath: string;
  storageUrl: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeError?: string;
  createdAt: Date;
}
```

---

### `src/lib/stores/auth.ts`

```ts
import { writable } from 'svelte/store';
import { auth } from '$lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export const currentUser = writable<User | null>(null);
export const authLoading = writable(true);

onAuthStateChanged(auth, (user) => {
  currentUser.set(user);
  authLoading.set(false);
});
```

---

### `src/routes/+layout.ts`

```ts
// SSRを無効化（Firebase AuthはクライアントサイドのみのSDKのため）
export const ssr = false;
```

---

### `src/routes/+layout.svelte`

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentUser, authLoading } from '$lib/stores/auth';
  import '../app.css';

  // 未認証の場合はログインページへリダイレクト
  $: if (!$authLoading && !$currentUser && $page.url.pathname !== '/login') {
    goto('/login');
  }
</script>

{#if $authLoading}
  <div class="flex items-center justify-center h-screen">
    <p class="text-gray-500">読み込み中...</p>
  </div>
{:else}
  <slot />
{/if}
```

---

### `src/routes/login/+page.svelte`

```svelte
<script lang="ts">
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

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
      <label class="block text-sm font-medium mb-1">メールアドレス</label>
      <input
        type="email"
        bind:value={email}
        class="w-full border rounded px-3 py-2 text-sm"
        placeholder="admin@example.com"
      />
    </div>
    <div class="mb-6">
      <label class="block text-sm font-medium mb-1">パスワード</label>
      <input
        type="password"
        bind:value={password}
        class="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
    <button
      on:click={handleLogin}
      disabled={loading}
      class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'ログイン中...' : 'ログイン'}
    </button>
  </div>
</div>
```

---

### `src/routes/(admin)/+layout.svelte`

```svelte
<script lang="ts">
  import { signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentUser } from '$lib/stores/auth';

  const navItems = [
    { href: '/',        label: 'ダッシュボード' },
    { href: '/groups',  label: '団体管理' },
    { href: '/videos',  label: '動画一覧' },
    { href: '/users',   label: 'ユーザー管理' }
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
        <button on:click={logout} class="text-sm text-red-500 hover:underline">
          ログアウト
        </button>
      </div>
    </aside>
    <main class="flex-1 overflow-y-auto p-8">
      <slot />
    </main>
  </div>
{/if}
```

---

### `src/routes/(admin)/+page.svelte`（ダッシュボード）

```svelte
<script lang="ts">
  import { db } from '$lib/firebase';
  import { collection, getCountFromServer } from 'firebase/firestore';
  import { onMount } from 'svelte';

  let groupCount = 0;
  let videoCount = 0;
  let userCount = 0;

  onMount(async () => {
    const [g, v, u] = await Promise.all([
      getCountFromServer(collection(db, 'groups')),
      getCountFromServer(collection(db, 'videos')),
      getCountFromServer(collection(db, 'users'))
    ]);
    groupCount = g.data().count;
    videoCount = v.data().count;
    userCount = u.data().count;
  });
</script>

<h2 class="text-2xl font-bold mb-6">ダッシュボード</h2>
<div class="grid grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <p class="text-sm text-gray-500">団体数</p>
    <p class="text-3xl font-bold mt-1">{groupCount}</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <p class="text-sm text-gray-500">動画数</p>
    <p class="text-3xl font-bold mt-1">{videoCount}</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <p class="text-sm text-gray-500">ユーザー数</p>
    <p class="text-3xl font-bold mt-1">{userCount}</p>
  </div>
</div>
```

---

### `src/routes/(admin)/groups/+page.ts`

```ts
import { db } from '$lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Group } from '$lib/types';

export const load: PageLoad = async () => {
  const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const groups: Group[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Group[];
  return { groups };
};
```

---

### `src/routes/(admin)/groups/+page.svelte`（団体一覧）

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { db } from '$lib/firebase';
  import { doc, deleteDoc } from 'firebase/firestore';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  async function deleteGroup(id: string) {
    if (!confirm('この団体を削除しますか？')) return;
    await deleteDoc(doc(db, 'groups', id));
    await invalidateAll();
  }
</script>

<div class="flex justify-between items-center mb-6">
  <h2 class="text-2xl font-bold">団体管理</h2>
  <a href="/groups/new" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
    + 新規作成
  </a>
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
              on:click={() => deleteGroup(group.id)}
              class="text-red-500 hover:underline text-xs"
            >削除</button>
          </td>
        </tr>
      {:else}
        <tr><td colspan="4" class="px-4 py-6 text-center text-gray-400">団体がありません</td></tr>
      {/each}
    </tbody>
  </table>
</div>
```

---

### `src/routes/(admin)/groups/new/+page.svelte`（団体新規作成）

```svelte
<script lang="ts">
  import { db } from '$lib/firebase';
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { currentUser } from '$lib/stores/auth';
  import { get } from 'svelte/store';

  let name = '';
  let description = '';
  let loading = false;
  let error = '';

  async function handleSubmit() {
    if (!name.trim()) { error = '団体名を入力してください'; return; }
    loading = true;
    try {
      await addDoc(collection(db, 'groups'), {
        name,
        description,
        createdBy: get(currentUser)?.uid ?? '',
        createdAt: serverTimestamp()
      });
      goto('/groups');
    } catch (e) {
      error = '作成に失敗しました';
    } finally {
      loading = false;
    }
  }
</script>

<h2 class="text-2xl font-bold mb-6">団体を新規作成</h2>
<div class="bg-white p-6 rounded-lg shadow-sm max-w-lg">
  {#if error}<p class="text-red-500 text-sm mb-4">{error}</p>{/if}
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">団体名 *</label>
    <input bind:value={name} class="w-full border rounded px-3 py-2 text-sm" />
  </div>
  <div class="mb-6">
    <label class="block text-sm font-medium mb-1">説明</label>
    <textarea bind:value={description} rows="3" class="w-full border rounded px-3 py-2 text-sm"></textarea>
  </div>
  <div class="flex gap-3">
    <button
      on:click={handleSubmit}
      disabled={loading}
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
    >
      {loading ? '作成中...' : '作成する'}
    </button>
    <a href="/groups" class="px-4 py-2 text-sm text-gray-600 hover:underline">キャンセル</a>
  </div>
</div>
```

---

### `src/routes/(admin)/videos/+page.ts`

```ts
import { db } from '$lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { Video } from '$lib/types';

export const load: PageLoad = async () => {
  const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const videos: Video[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Video[];
  return { videos };
};
```

---

### `src/routes/(admin)/videos/+page.svelte`（動画一覧）

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import type { VideoStatus } from '$lib/types';

  export let data: PageData;

  let filterStatus: VideoStatus | 'all' = 'all';

  const statusLabel: Record<VideoStatus, string> = {
    pending: '投稿待ち',
    uploading_to_youtube: 'アップロード中',
    published: '投稿完了',
    failed: 'エラー',
    rejected: '却下'
  };

  const statusColor: Record<VideoStatus, string> = {
    pending: 'text-yellow-600',
    uploading_to_youtube: 'text-blue-600',
    published: 'text-green-600',
    failed: 'text-red-600',
    rejected: 'text-gray-500'
  };

  $: filtered = filterStatus === 'all'
    ? data.videos
    : data.videos.filter(v => v.status === filterStatus);
</script>

<div class="flex justify-between items-center mb-6">
  <h2 class="text-2xl font-bold">動画一覧（全団体）</h2>
  <select bind:value={filterStatus} class="border rounded px-3 py-2 text-sm">
    <option value="all">すべて</option>
    {#each Object.entries(statusLabel) as [val, label]}
      <option value={val}>{label}</option>
    {/each}
  </select>
</div>

<div class="bg-white rounded-lg shadow-sm overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-gray-50 border-b">
      <tr>
        <th class="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
        <th class="text-left px-4 py-3 font-medium text-gray-600">団体ID</th>
        <th class="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
        <th class="text-left px-4 py-3 font-medium text-gray-600">YouTube</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as video}
        <tr class="border-b hover:bg-gray-50">
          <td class="px-4 py-3">
            <a href="/videos/{video.id}" class="text-blue-600 hover:underline">{video.title}</a>
          </td>
          <td class="px-4 py-3 text-gray-600">{video.groupId}</td>
          <td class="px-4 py-3 {statusColor[video.status]}">
            {statusLabel[video.status]}
          </td>
          <td class="px-4 py-3">
            {#if video.youtubeUrl}
              <a href={video.youtubeUrl} target="_blank" class="text-blue-500 hover:underline">
                YouTube で見る
              </a>
            {:else}
              <span class="text-gray-400">—</span>
            {/if}
          </td>
        </tr>
      {:else}
        <tr><td colspan="4" class="px-4 py-6 text-center text-gray-400">動画がありません</td></tr>
      {/each}
    </tbody>
  </table>
</div>
```

---

### `src/routes/(admin)/users/+page.ts`

```ts
import { db } from '$lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PageLoad } from './$types';
import type { AppUser } from '$lib/types';

export const load: PageLoad = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users: AppUser[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as AppUser[];
  return { users };
};
```

---

### `src/routes/(admin)/users/+page.svelte`（ユーザー管理）

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
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
            <span class="{user.role === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-600'}">
              {user.role ?? 'user'}
            </span>
          </td>
        </tr>
      {:else}
        <tr><td colspan="3" class="px-4 py-6 text-center text-gray-400">ユーザーがありません</td></tr>
      {/each}
    </tbody>
  </table>
</div>
```

---

## 開発ルール

- **ブランチ**: `main`（本番）/ `develop`（開発）/ `feature/*`（機能開発）
- **コミットメッセージ**: `feat:`, `fix:`, `chore:` などのプレフィックスをつける
- **環境変数**: `.env` は絶対にコミットしない。`.env.example` は必ずコミットする
- **Firestore `/youtube_credentials`**: adminからは一切参照・書き込みしない（systemサーバー専用）
- **YouTube公開設定**: adminからは変更しない。YouTubeスタジオで運営が手動対応

---

## CI/CD

### GitHub Actions

プロジェクトには2つのワークフローが設定されています：

**1. CI（継続的インテグレーション）**
- トリガー: `main`, `develop` ブランチへのpush、PR作成時
- 実行内容:
  - ESLintによるコードチェック
  - Prettierによるフォーマットチェック
  - svelte-checkによる型チェック
  - ビルドテスト

**2. Deploy（Vercelへの自動デプロイ）**
- トリガー: `main` ブランチへのpush
- 実行内容:
  - Vercel本番環境への自動デプロイ

### デプロイ方法

詳細は `.github/DEPLOYMENT.md` を参照してください。

**Vercel（推奨）**
- mainブランチへのpushで自動デプロイ
- プレビュー環境の自動作成
- カスタムドメイン設定可能

**Firebase Hosting（代替案）**
```bash
npm run build
firebase deploy --only hosting
```

---

## TODO（未決定事項）

- [x] SvelteKitプロジェクト作成・基本構成
- [x] 全画面の実装
- [x] CI/CD設定
- [ ] 管理者権限の階層設計（スーパー管理者 vs 一般管理者など）
- [ ] E2Eテストの実装