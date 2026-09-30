import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Static MPA build for GitHub Pages. Each deck page keeps its original URL:
// /ai-for-unity/, /corel-for-mac/, /touch-my-heart/, /avatars/, /starkit/, /xr-prototypes/, /vr-for-everybody/, /a1/
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
        'ai-for-unity-cover': resolve(__dirname, 'src/ai-for-unity/cover/index.html'),
        'corel-for-mac': resolve(__dirname, 'src/corel-for-mac/index.html'),
        'corel-for-mac-cover': resolve(__dirname, 'src/corel-for-mac/cover/index.html'),
        'touch-my-heart': resolve(__dirname, 'src/touch-my-heart/index.html'),
        'touch-my-heart-cover': resolve(__dirname, 'src/touch-my-heart/cover/index.html'),
        avatars: resolve(__dirname, 'src/avatars/index.html'),
        'avatars-cover': resolve(__dirname, 'src/avatars/cover/index.html'),
        starkit: resolve(__dirname, 'src/starkit/index.html'),
        'xr-prototypes': resolve(__dirname, 'src/xr-prototypes/index.html'),
        'vr-for-everybody': resolve(__dirname, 'src/vr-for-everybody/index.html'),
        a1: resolve(__dirname, 'src/a1/index.html'),
        cv: resolve(__dirname, 'src/cv/index.html'),
      },
    },
  },
});
