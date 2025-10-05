import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        product: resolve(__dirname, 'product.html'),
        contact: resolve(__dirname, 'contact.html'),
        'admin-login': resolve(__dirname, 'admin-login.html'),
        'admin-dashboard': resolve(__dirname, 'admin-dashboard.html'),
        'admin-products': resolve(__dirname, 'admin-products.html'),
        'admin-clients': resolve(__dirname, 'admin-clients.html'),
      },
    },
  },
});
