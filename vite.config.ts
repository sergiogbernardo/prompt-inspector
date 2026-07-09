import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this repository under /prompt-inspector/.
export default defineConfig({
  base: '/prompt-inspector/',
  plugins: [react()],
});
