import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: repoName ? `/${repoName}/` : '/',
})
