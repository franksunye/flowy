/**
 * Vite 配置文件
 *
 * 这个配置文件为 Flowy 项目建立现代化构建系统，
 * 完全不修改原始代码，只是提供现代化的开发和构建体验。
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',

    // 清空输出目录
    emptyOutDir: true,

    // 库模式构建
    lib: {
      // 入口文件
      entry: resolve(process.cwd(), 'src/flowy.js'),

      // 库名称
      name: 'flowy',

      // 文件名
      fileName: format => `flowy.${format}.js`,

      // 输出格式
      formats: ['es', 'umd', 'iife'],
    },

    // Rollup 选项
    rollupOptions: {
      // 外部依赖（不打包进库中）
      external: ['jquery'],

      // 全局变量映射
      output: {
        globals: {
          jquery: '$',
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },

    // 源码映射
    sourcemap: true,
  },

  // 插件配置
  plugins: [],

  // CSS 配置
  css: {
    // 代码分割
    codeSplit: true,

    // 预处理器选项
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },

  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests'),
      '@docs': resolve(__dirname, 'docs'),
    },
  },

  // 定义全局常量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  // 优化配置
  optimizeDeps: {
    include: ['jquery'],
  },
});
