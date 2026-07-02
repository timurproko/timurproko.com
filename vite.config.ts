import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Static MPA build for GitHub Pages. Each deck page keeps its original URL:
// /ai-for-unity/, /corel-for-mac/, /touch-my-heart/, /avatars/
export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'src/index.html'),
        'ai-for-unity': resolve(__dirname, 'src/ai-for-unity/index.html'),
        'corel-for-mac': resolve(__dirname, 'src/corel-for-mac/index.html'),
        'touch-my-heart': resolve(__dirname, 'src/touch-my-heart/index.html'),
        avatars: resolve(__dirname, 'src/avatars/index.html'),
        cv: resolve(__dirname, 'src/cv/index.html'),
      },
    },
  },
});
