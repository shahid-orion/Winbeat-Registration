import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const target = env.VITE_PROXY_TARGET || 'http://localhost:61234';

	return {
		plugins: [react()],
		resolve: {
			alias: { '@': path.resolve(__dirname, './src') },
		},
		server: {
			proxy: {
				'/api': {
					target,
					changeOrigin: true,
					secure: false,
					cookieDomainRewrite: 'localhost',
					cookiePathRewrite: '/',
				},
			},
		},
	};
});
