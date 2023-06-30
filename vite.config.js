import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		// https://cn.vitejs.dev/config/#resolve-alias
		alias: {
			// 设置别名
			'@': path.resolve(__dirname, './src'),
		},
		// https://cn.vitejs.dev/config/#resolve-extensions
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.scss'],
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "@/assets/scss/utils.scss";`,
			},
		},
		postcss: {
			plugins: [
				{
					postcssPlugin: 'internal:charset-removal',
					AtRule: {
						charset: (atRule) => {
							if (atRule.name === 'charset') {
								atRule.remove()
							}
						},
					},
				},
			],
		},
	},
})
