import type { Icon } from './types';
import iconIndex from './icon-index.json';

const ICONS_PER_PAGE = 60;

// All icon metadata from simple-icons
export const allIcons: Omit<Icon, 'svg'>[] = iconIndex as Omit<Icon, 'svg'>[];

// Get a page of icons (metadata only, no SVG loading)
export function getIconPage(page: number): Omit<Icon, 'svg'>[] {
	const start = page * ICONS_PER_PAGE;
	const end = Math.min(start + ICONS_PER_PAGE, allIcons.length);
	return allIcons.slice(start, end);
}

// Search icons (returns metadata only)
export function searchIcons(query: string, limit = 100): Omit<Icon, 'svg'>[] {
	const q = query.toLowerCase();
	return allIcons
		.filter((icon) => icon.title.toLowerCase().includes(q))
		.slice(0, limit);
}

// Get a single icon by slug
export function getIconBySlug(slug: string): Omit<Icon, 'svg'> | null {
	return allIcons.find((i) => i.slug === slug) ?? null;
}

// Build CDN URL for a simple-icons SVG
export function getIconSvgUrl(slug: string): string {
	return `https://cdn.jsdelivr.net/npm/simple-icons@16.14.0/icons/${slug}.svg`;
}

// Total icon count
export const totalIcons = allIcons.length;
