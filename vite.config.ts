import dts from 'vite-plugin-dts';

export default {
  plugins: [
    dts({
      entryRoot: 'src',
      insertTypesEntry: false,
      staticImport: true
    })
  ],
  build: {
    minify: 'terser',
    lib: {
      entry: 'src/storage.ts',
      name: 'AxoloStorage',
      formats: ['es', 'umd'],
      fileName: (format: string) => `storage.${format}.js`
    }
  }
}
