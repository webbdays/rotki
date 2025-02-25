/// <reference types="vitest" />
import { builtinModules } from 'module';
import { join, resolve } from 'path';
import vue from '@vitejs/plugin-vue2';
import AutoImport from 'unplugin-auto-import/vite';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { checker } from 'vite-plugin-checker';
// @ts-ignore
import istanbul from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa';

const PACKAGE_ROOT = __dirname;
const envPath = process.env.VITE_PUBLIC_PATH;
const publicPath = envPath ? envPath : '/';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = !!process.env.VITE_TEST;

if (isTest) {
  console.log('Running in test mode. Enabling Coverage');
}

if (envPath) {
  console.log(`A custom publicPath has been specified, using ${envPath}`);
}

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(PACKAGE_ROOT, 'src'),
      '~@': resolve(PACKAGE_ROOT, 'src'),
      ...(process.env.VITEST
        ? {
            vue: 'vue/dist/vue.runtime.mjs'
          }
        : {})
    }
  },
  // @ts-ignore
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: ['vuetify']
    },
    setupFiles: ['tests/unit/setup-files/setup.ts'],
    coverage: {
      reportsDirectory: 'tests/unit/coverage',
      reporter: ['json'],
      include: ['src/*'],
      exclude: ['node_modules', 'tests/', '**/*.d.ts']
    }
  },
  base: publicPath,
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  plugins: [
    splitVendorChunkPlugin(),
    vue(),
    checker({
      vueTsc: !(process.env.CI || process.env.VITE_TEST || process.env.VITEST)
    }),
    AutoImport({
      imports: [
        'vue',
        'vue/macros',
        '@vueuse/core',
        'pinia',
        { 'vue-i18n-composable': ['useI18n'] },
        { '@vueuse/shared': ['get', 'set'] }
      ],
      dts: 'src/auto-imports.d.ts',
      //todo: cleanup export before enabling
      //dirs: ['src/composables', 'src/store']
      vueTemplate: true,
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [VuetifyResolver()],
      types: [
        {
          from: 'vue-router',
          names: ['RouterLink', 'RouterView']
        }
      ]
    }),
    ...(isTest
      ? [
          istanbul({
            include: 'src/*',
            exclude: ['node_modules', 'tests/', '**/*.d.ts'],
            extension: ['.ts', '.vue']
          })
        ]
      : []),
    VitePWA({
      base: '',
      registerType: 'prompt',
      manifest: false
    })
  ],
  server: {
    port: 8080,
    hmr: isDevelopment && !process.env.CI
  },
  build: {
    sourcemap: isDevelopment || isTest,
    outDir: 'dist',
    assetsDir: '.',
    minify: true,
    rollupOptions: {
      external: [
        'electron',
        'electron-devtools-installer',
        ...builtinModules.flatMap(p => [p, `node:${p}`])
      ],
      input: join(PACKAGE_ROOT, 'index.html')
    },
    emptyOutDir: false
  }
});
