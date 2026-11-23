import base from './playwright.config';
export default {
	...base,
	webServer: { command: 'npm run build && npx vite preview --port 4174 --strictPort', port: 4174, timeout: 600_000 },
	use: { ...base.use, baseURL: 'http://localhost:4174' }
};
