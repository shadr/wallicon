import type { Theme } from './types';

export const themes: Theme[] = [
	{
		id: 'dark-gradient',
		name: 'Dark Gradient',
		background: '#1a1a2e',
		gradient: ['#16213e', '#0f3460'],
		iconStyle: 'circle',
		layout: 'grid',
		gridSize: 120,
		spacing: 20,
		opacity: 0.9,
		rotation: false
	},
	{
		id: 'light-clean',
		name: 'Light Clean',
		background: '#ffffff',
		gradient: ['#f5f5f5', '#e0e0e0'],
		iconStyle: 'rounded',
		layout: 'grid',
		gridSize: 100,
		spacing: 30,
		opacity: 0.85,
		rotation: false
	},
	{
		id: 'cyberpunk',
		name: 'Cyberpunk',
		background: '#0d0221',
		gradient: ['#0f083f', '#ff006e', '#8338ec'],
		iconStyle: 'square',
		layout: 'scatter',
		opacity: 0.8,
		rotation: true
	},
	{
		id: 'nature',
		name: 'Nature',
		background: '#2d6a4f',
		gradient: ['#40916c', '#52b788', '#74c69d'],
		iconStyle: 'circle',
		layout: 'scatter',
		opacity: 0.75,
		rotation: true
	},
	{
		id: 'sunset',
		name: 'Sunset',
		background: '#ff6b35',
		gradient: ['#f7931e', '#ffd23f', '#ff6b35'],
		iconStyle: 'rounded',
		layout: 'arc',
		opacity: 0.9,
		rotation: false
	},
	{
		id: 'ocean',
		name: 'Ocean',
		background: '#0077b6',
		gradient: ['#00b4d8', '#90e0ef', '#caf0f8'],
		iconStyle: 'circle',
		layout: 'spiral',
		opacity: 0.85,
		rotation: false
	},
	{
		id: 'minimal',
		name: 'Minimal',
		background: '#f8f9fa',
		iconStyle: 'none',
		layout: 'grid',
		gridSize: 80,
		spacing: 40,
		opacity: 0.6,
		rotation: false
	},
	{
		id: 'neon',
		name: 'Neon',
		background: '#0a0a0a',
		gradient: ['#ff00ff', '#00ffff', '#ff00ff'],
		iconStyle: 'rounded',
		layout: 'grid',
		gridSize: 100,
		spacing: 25,
		opacity: 0.95,
		rotation: false
	},
	{
		id: 'pastel',
		name: 'Pastel Dream',
		background: '#fce4ec',
		gradient: ['#f8bbd0', '#e1bee7', '#ce93d8'],
		iconStyle: 'circle',
		layout: 'scatter',
		opacity: 0.7,
		rotation: true
	},
	{
		id: 'midnight',
		name: 'Midnight',
		background: '#0a0e27',
		gradient: ['#1a1f3a', '#2d1b69'],
		iconStyle: 'rounded',
		layout: 'spiral',
		opacity: 0.85,
		rotation: false
	}
];
