import type { Icon } from './types';
import iconIndex from './icon-index.json';

// All icon metadata from simple-icons (loaded upfront, no SVG data)
export const allIcons: Omit<Icon, 'svg'>[] = iconIndex as Omit<Icon, 'svg'>[];

// Build CDN URL for a simple-icons SVG
export function getIconSvgUrl(slug: string): string {
	return `https://cdn.jsdelivr.net/npm/simple-icons@16.14.0/icons/${slug}.svg`;
}

// Total icon count
export const totalIcons = allIcons.length;

// Lookup map for O(1) slug resolution
const iconMap = new Map(allIcons.map((i) => [i.slug, i]));

export function getIconBySlug(slug: string): Omit<Icon, 'svg'> | null {
	return iconMap.get(slug) ?? null;
}
