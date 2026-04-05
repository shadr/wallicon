import type { WallpaperConfig, LayoutMode } from './types';

interface State {
	icons: string[];
	theme: string;
	config: WallpaperConfig;
}

const VALID_LAYOUTS: LayoutMode[] = ['grid', 'square-spiral', 'hex-spiral', 'hex-symmetric', 'arc'];

export function encodeState(state: State): string {
	const params = new URLSearchParams();

	// Icons as comma-separated slugs
	if (state.icons.length > 0) {
		params.set('icons', state.icons.join(','));
	}

	// Theme
	if (state.theme) {
		params.set('theme', state.theme);
	}

	// Config
	if (state.config.layout !== 'grid') {
		params.set('layout', state.config.layout);
	}
	if (state.config.iconSize !== 120) {
		params.set('size', String(state.config.iconSize));
	}
	if (state.config.spacing !== 20) {
		params.set('space', String(state.config.spacing));
	}
	if (state.config.opacity !== 0.9) {
		params.set('opacity', String(state.config.opacity));
	}

	const str = params.toString();
	return str ? `?${str}` : '';
}

export function decodeState(query: string): Partial<State> {
	const params = new URLSearchParams(query);
	const state: Partial<State> = {};

	// Icons
	const icons = params.get('icons');
	if (icons) {
		state.icons = icons.split(',');
	}

	// Theme
	const theme = params.get('theme');
	if (theme) {
		state.theme = theme;
	}

	// Config
	const layoutParam = params.get('layout');
	const layout: LayoutMode =
		layoutParam && VALID_LAYOUTS.includes(layoutParam as LayoutMode)
			? (layoutParam as LayoutMode)
			: 'grid';
	const size = params.get('size');
	const space = params.get('space');
	const opacity = params.get('opacity');

	state.config = {
		layout,
		iconSize: size && !isNaN(Number(size)) ? Number(size) : 120,
		spacing: space && !isNaN(Number(space)) ? Number(space) : 20,
		opacity: opacity && !isNaN(Number(opacity)) ? Number(opacity) : 0.9
	};

	return state;
}
