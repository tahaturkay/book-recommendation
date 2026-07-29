import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // test, expect gibi kelimeleri her dosyada import etmemizi engeller
    environment: 'jsdom', // Hafızada sanal bir tarayıcı (DOM) oluşturur
    setupFiles: './src/setupTests.js', // Testler başlamadan önce çalışacak ayar dosyası
  }
})
