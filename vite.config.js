import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        research: resolve(import.meta.dirname, 'research.html'),
        projects: resolve(import.meta.dirname, 'projects.html'),
        events: resolve(import.meta.dirname, 'events.html'),
        members: resolve(import.meta.dirname, 'members.html'),
        join: resolve(import.meta.dirname, 'join.html'),
      },
    },
  },
});
