export interface Icon {
	id: string;
	title: string;
	hex: string;
	slug: string;
	svg?: string;
}

export interface Theme {
	id: string;
	name: string;
	background: string;
	accentColors: string[];
}

export type LayoutMode = 'grid' | 'scatter' | 'arc' | 'spiral';

export interface WallpaperConfig {
	layout: LayoutMode;
	iconSize: number;
	spacing: number;
	opacity: number;
}
