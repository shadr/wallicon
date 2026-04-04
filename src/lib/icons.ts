import type { Icon } from './types';

export const icons: Icon[] = [
	{
		id: 'blender',
		name: 'Blender',
		category: '3D & Animation',
		color: '#E87D0D',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#E87D0D"/><path d="M30 65 Q35 35 50 30 Q65 35 70 65 Q65 55 50 55 Q35 55 30 65Z" fill="white"/><circle cx="50" cy="42" r="6" fill="white"/></svg>`
	},
	{
		id: 'godot',
		name: 'Godot',
		category: 'Game Engine',
		color: '#478CBF',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#478CBF"/><circle cx="50" cy="38" r="12" fill="white"/><rect x="38" y="50" width="24" height="20" rx="3" fill="white"/><circle cx="50" cy="38" r="5" fill="#478CBF"/></svg>`
	},
	{
		id: 'linux',
		name: 'Linux (Tux)',
		category: 'Operating System',
		color: '#FCC624',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="55" rx="25" ry="30" fill="#FCC624"/><circle cx="50" cy="30" r="18" fill="#FCC624"/><circle cx="43" cy="28" r="3" fill="black"/><circle cx="57" cy="28" r="3" fill="black"/><ellipse cx="50" cy="33" rx="4" ry="2" fill="#FF9900"/><ellipse cx="35" cy="55" rx="8" ry="15" fill="#FCC624"/><ellipse cx="65" cy="55" rx="8" ry="15" fill="#FCC624"/></svg>`
	},
	{
		id: 'nixos',
		name: 'NixOS',
		category: 'Operating System',
		color: '#5277C3',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#5277C3"/><path d="M50 20 L55 40 L50 35 L45 40 Z" fill="white"/><path d="M50 80 L55 60 L50 65 L45 60 Z" fill="white"/><path d="M20 50 L40 45 L35 50 L40 55 Z" fill="white"/><path d="M80 50 L60 45 L65 50 L60 55 Z" fill="white"/><path d="M28 28 L42 38 L38 42 L32 35 Z" fill="white"/><path d="M72 72 L58 62 L62 58 L68 65 Z" fill="white"/><path d="M72 28 L58 38 L62 42 L68 35 Z" fill="white"/><path d="M28 72 L42 62 L38 58 L32 65 Z" fill="white"/><circle cx="50" cy="50" r="8" fill="white"/></svg>`
	},
	{
		id: 'ubuntu',
		name: 'Ubuntu',
		category: 'Operating System',
		color: '#E95420',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#E95420"/><circle cx="50" cy="25" r="10" fill="white"/><circle cx="28" cy="62" r="10" fill="white"/><circle cx="72" cy="62" r="10" fill="white"/><circle cx="50" cy="50" r="15" fill="none" stroke="white" stroke-width="3"/></svg>`
	},
	{
		id: 'arch',
		name: 'Arch Linux',
		category: 'Operating System',
		color: '#1793D1',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#1793D1"/><path d="M35 70 L50 25 L65 70 L58 70 L55 60 L45 60 L42 70 Z" fill="white"/><path d="M47 50 Q50 45 53 50" fill="none" stroke="white" stroke-width="2"/></svg>`
	},
	{
		id: 'fedora',
		name: 'Fedora',
		category: 'Operating System',
		color: '#294172',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#294172"/><path d="M35 65 Q40 30 50 25 Q60 30 65 65" fill="none" stroke="white" stroke-width="5"/><path d="M35 65 L65 65" stroke="white" stroke-width="5"/><circle cx="50" cy="45" r="8" fill="white"/></svg>`
	},
	{
		id: 'docker',
		name: 'Docker',
		category: 'Development',
		color: '#2496ED',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#2496ED"/><rect x="25" y="45" width="8" height="8" fill="white"/><rect x="35" y="45" width="8" height="8" fill="white"/><rect x="45" y="45" width="8" height="8" fill="white"/><rect x="55" y="45" width="8" height="8" fill="white"/><rect x="35" y="35" width="8" height="8" fill="white"/><rect x="45" y="35" width="8" height="8" fill="white"/><path d="M20 60 Q50 70 80 60" fill="none" stroke="white" stroke-width="3"/></svg>`
	},
	{
		id: 'git',
		name: 'Git',
		category: 'Development',
		color: '#F05032',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#F05032"/><circle cx="50" cy="30" r="8" fill="white"/><circle cx="50" cy="70" r="8" fill="white"/><circle cx="30" cy="50" r="8" fill="white"/><line x1="50" y1="38" x2="50" y2="62" stroke="white" stroke-width="4"/><line x1="38" y1="50" x2="42" y2="50" stroke="white" stroke-width="4"/></svg>`
	},
	{
		id: 'vscode',
		name: 'VS Code',
		category: 'Development',
		color: '#007ACC',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#007ACC"/><path d="M30 35 L65 50 L30 65 Z" fill="white"/><path d="M30 35 L40 40 L40 60 L30 65 Z" fill="white" opacity="0.7"/></svg>`
	},
	{
		id: 'python',
		name: 'Python',
		category: 'Programming',
		color: '#3776AB',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#3776AB"/><path d="M35 40 Q35 30 45 30 L55 30 Q65 30 65 40 L65 45 L50 45 Q40 45 40 55 L40 60 Q40 70 50 70 L60 70 Q70 70 70 60 L70 55 L55 55 Q65 55 65 45 L65 40" fill="none" stroke="white" stroke-width="4"/><circle cx="50" cy="50" r="5" fill="white"/></svg>`
	},
	{
		id: 'rust',
		name: 'Rust',
		category: 'Programming',
		color: '#DEA584',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#DEA584"/><circle cx="50" cy="50" r="25" fill="none" stroke="white" stroke-width="3"/><path d="M50 25 L55 40 L50 35 L45 40 Z" fill="white"/><path d="M50 75 L55 60 L50 65 L45 60 Z" fill="white"/><path d="M25 50 L40 45 L35 50 L40 55 Z" fill="white"/><path d="M75 50 L60 45 L65 50 L60 55 Z" fill="white"/></svg>`
	},
	{
		id: 'nodejs',
		name: 'Node.js',
		category: 'Development',
		color: '#339933',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#339933"/><path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" fill="none" stroke="white" stroke-width="4"/><text x="50" y="58" font-size="24" font-weight="bold" fill="white" text-anchor="middle">N</text></svg>`
	},
	{
		id: 'react',
		name: 'React',
		category: 'Development',
		color: '#61DAFB',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#61DAFB"/><circle cx="50" cy="50" r="8" fill="#1a1a2e"/><ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="#1a1a2e" stroke-width="2"/><ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="#1a1a2e" stroke-width="2" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="#1a1a2e" stroke-width="2" transform="rotate(120 50 50)"/></svg>`
	},
	{
		id: 'vue',
		name: 'Vue.js',
		category: 'Development',
		color: '#4FC08D',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#4FC08D"/><path d="M30 35 L50 35 L65 60 L50 60 L45 50 L40 60 L25 60 Z" fill="white" opacity="0.9"/><path d="M50 35 L70 35 L85 60 L70 60 L60 45 L55 60 L40 60 Z" fill="white" opacity="0.7"/></svg>`
	},
	{
		id: 'svelte',
		name: 'Svelte',
		category: 'Development',
		color: '#FF3E00',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#FF3E00"/><path d="M40 35 Q60 30 65 45 Q70 60 50 65 Q35 68 30 55 Q28 45 40 35Z" fill="white"/></svg>`
	},
	{
		id: 'firefox',
		name: 'Firefox',
		category: 'Browser',
		color: '#FF7139',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#FF7139"/><circle cx="50" cy="50" r="20" fill="#FFC239"/><path d="M30 50 Q30 25 50 20 Q45 35 50 50 Q55 65 50 80 Q70 75 70 50 Q70 30 50 20" fill="none" stroke="#FFC239" stroke-width="5"/></svg>`
	},
	{
		id: 'vlc',
		name: 'VLC',
		category: 'Media',
		color: '#FF8800',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#FF8800"/><path d="M40 30 L45 70 L55 70 L60 30 Z" fill="white"/><circle cx="50" cy="25" r="8" fill="white"/><path d="M35 70 L65 70 L60 75 L40 75 Z" fill="white"/></svg>`
	},
	{
		id: 'gimp',
		name: 'GIMP',
		category: 'Graphics',
		color: '#89BC3B',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#89BC3B"/><circle cx="50" cy="50" r="20" fill="white"/><circle cx="50" cy="50" r="8" fill="#89BC3B"/><path d="M50 30 Q60 35 60 50 Q60 65 50 70" fill="none" stroke="white" stroke-width="4"/></svg>`
	},
	{
		id: 'inkscape',
		name: 'Inkscape',
		category: 'Graphics',
		color: '#000000',
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#000000"/><path d="M50 20 Q70 35 65 55 Q60 75 50 80 Q40 75 35 55 Q30 35 50 20Z" fill="white" opacity="0.9"/><circle cx="50" cy="45" r="10" fill="#000000"/><path d="M45 45 L55 45" stroke="#000000" stroke-width="2"/></svg>`
	}
];

export const categories = [...new Set(icons.map(i => i.category))];
