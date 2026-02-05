import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 開發伺服器設定
    port: 3333,
    // 允許外部存取（方便手機測試）
    host: true,
  },
  build: {
    // 建置輸出目錄
    outDir: "dist",
  },
});
