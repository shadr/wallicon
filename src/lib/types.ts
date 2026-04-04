export interface Icon {
	id: string;
	name: string;
	category: string;
	svg: string;
	color: string;
}

export interface Theme {
	id: string;
	name: string;
	background: string;
	gradient?: string[];
	iconStyle: 'circle' | 'square' | 'rounded' | 'none';
	layout: 'grid' | 'scatter' | 'arc' | 'spiral';
	gridSize?: number;
	spacing?: number;
	opacity?: number;
	rotation?: boolean;
}
