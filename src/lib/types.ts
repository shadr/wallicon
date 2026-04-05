export interface Icon {
	id: string;
	title: string;
	hex: string;
	slug: string;
}

export interface Theme {
	id: string;
	name: string;
	background: string;
	accentColors: string[];
}

export type LayoutMode = 'grid' | 'square-spiral' | 'hex-spiral' | 'hex-symmetric' | 'arc';

export interface WallpaperConfig {
	layout: LayoutMode;
	iconSize: number;
	spacing: number;
	opacity: number;
}
