module.exports = {
	apps: [
		{
			name: 'wardns-server',
			script: 'src/index.ts',
			instances: 1,
			watch: ['dist', 'src'],
			log: './console.log',
			error: './error.log',
			merge_logs: true,
			max_memory_restart: '500M'
		},
		{
			name: 'wardns-server:tsc',
			script: 'tsc -w'
		}
	]
};