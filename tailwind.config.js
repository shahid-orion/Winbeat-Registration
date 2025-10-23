// // tailwind.config.js
// export default {
// 	content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
// 	theme: {
// 		extend: {},
// 	},
// 	plugins: [],
// };
//////////
// tailwind.config.ts
export default {
	content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: {
					blue: '#09569e', // core deep blue
					light: '#3a7bb8', // sky blue
					dark: '#063a6e', // navy
					aqua: '#00c9ff', // bright aqua
					pearl: '#f8fafc', // soft white
					silver: '#d9e2ec', // subtle gray
					ice: '#e0f2fe', // NEW: pale icy blue for hovers
				},
			},
			backgroundImage: {
				'blue-gradient': 'linear-gradient(to right, #09569e, #00c9ff)',
				'white-shiny':
					'linear-gradient(to bottom right, #ffffff, #f8fafc, #f1f5f9)',
			},
		},
	},
	plugins: [],
};
