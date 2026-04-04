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
	gradient?: string[];
}

export type LayoutMode = 'grid' | 'scatter' | 'arc' | 'spiral';
export type IconStyle = 'circle' | 'square' | 'rounded' | 'none';

export interface WallpaperConfig {
	layout: LayoutMode;
	iconStyle: IconStyle;
	iconSize: number;
	spacing: number;
	opacity: number;
	rotation: boolean;
}
