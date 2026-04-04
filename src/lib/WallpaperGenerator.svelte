<script lang="ts">
	import type { Icon } from '$lib/types';
	import type { Theme } from '$lib/types';
	import type { WallpaperConfig } from '$lib/types';
	import { getIconSvgUrl } from '$lib/icons';

	interface Props {
		selectedIcons: Icon[];
		theme: Theme;
		config: WallpaperConfig;
		width?: number;
		height?: number;
	}

	let { selectedIcons, theme, config, width = 1920, height = 1080 }: Props = $props();

	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let isGenerating = $state(false);
	let shuffleSeed = $state(0);

	// Persistent caches — survive across renders
	const svgTextCache = new Map<string, string>();
	const imageCache = new Map<string, Map<string, HTMLImageElement>>();

	// Assign colors to maximize sum of pairwise distances between same-colored icons
	function assignColors(
		positions: Array<{ x: number; y: number }>,
		colors: string[]
	): string[] {
		const n = positions.length;
		const k = colors.length;
		if (k === 0) return Array(n).fill('#ffffff');

		const result: string[] = new Array(n);
		const assigned = new Set<number>();
		const colorPositions: number[][] = colors.map(() => []);

		for (let i = 0; i < n; i++) {
			const colorIdx = i % k;
			let bestPos = -1;
			let bestScore = -1;

			for (let p = 0; p < n; p++) {
				if (assigned.has(p)) continue;

				let score = Infinity;
				for (const cp of colorPositions[colorIdx]) {
					const dx = positions[p].x - positions[cp].x;
					const dy = positions[p].y - positions[cp].y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < score) score = dist;
				}

				if (colorPositions[colorIdx].length === 0) score = 0;

				if (score > bestScore) {
					bestScore = score;
					bestPos = p;
				}
			}

			if (bestPos !== -1) {
				assigned.add(bestPos);
				result[bestPos] = colors[colorIdx];
				colorPositions[colorIdx].push(bestPos);
			}
		}

		return result;
	}

	async function loadIconWithColor(icon: { slug: string }, color: string): Promise<HTMLImageElement> {
		const cacheKey = `${icon.slug}:${color}`;
		const cached = imageCache.get(icon.slug)?.get(color);
		if (cached) return cached;

		let svgText = svgTextCache.get(icon.slug);
		if (!svgText) {
			const res = await fetch(getIconSvgUrl(icon.slug));
			svgText = await res.text();
			svgTextCache.set(icon.slug, svgText);
		}

		const recolored = svgText
			.replace(/<svg /, `<svg fill="${color}" `)
			.replace(/fill="([^"]*?)"/g, (m, v) => {
				if (v === 'none' || v === 'transparent') return m;
				return `fill="${color}"`;
			});

		const blob = new Blob([recolored], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const i = new Image();
			i.onload = () => { URL.revokeObjectURL(url); resolve(i); };
			i.onerror = () => { URL.revokeObjectURL(url); reject(new Error(icon.slug)); };
			i.src = url;
		});

		if (!imageCache.has(icon.slug)) imageCache.set(icon.slug, new Map());
		imageCache.get(icon.slug)!.set(color, img);
		return img;
	}

	async function loadAllImages(
		icons: Array<{ slug: string }>,
		colors: string[]
	): Promise<HTMLImageElement[]> {
		const images: HTMLImageElement[] = [];
		for (let i = 0; i < icons.length; i++) {
			const img = await loadIconWithColor(icons[i], colors[i]);
			images.push(img);
		}
		return images;
	}

	function drawIcon(
		ctx: CanvasRenderingContext2D,
		img: HTMLImageElement,
		x: number,
		y: number,
		size: number
	) {
		ctx.save();
		ctx.globalAlpha = config.opacity;
		ctx.drawImage(img, x, y, size, size);
		ctx.restore();
	}

	async function generateWallpaper() {
		if (selectedIcons.length === 0) return;

		isGenerating = true;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = theme.background;
		ctx.fillRect(0, 0, width, height);

		const { layout, iconSize, spacing } = config;

		// Shuffle icons if seed is non-zero
		const shuffled = shuffleSeed > 0 ? [...selectedIcons] : selectedIcons;
		if (shuffleSeed > 0) {
			// Fisher-Yates seeded shuffle
			let seed = shuffleSeed;
			const rand = () => {
				seed = (seed * 16807 + 0) % 2147483647;
				return (seed - 1) / 2147483646;
			};
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(rand() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
		}

		// 1. Compute positions
		const positions = computePositions(layout, shuffled.length, iconSize, spacing);

		// 2. Assign colors to maximize same-color distances
		const colors = assignColors(positions, theme.accentColors);

		// 3. Load images with assigned colors
		const iconImages = await loadAllImages(shuffled, colors);

		// 4. Draw
		iconImages.forEach((img, i) => {
			const px = positions[i].x - iconSize / 2;
			const py = positions[i].y - iconSize / 2;
			drawIcon(ctx, img, px, py, iconSize);
		});

		isGenerating = false;
	}

	function computePositions(
		layout: string,
		count: number,
		iconSize: number,
		spacing: number
	): Array<{ x: number; y: number }> {
		const centerX = width / 2;
		const centerY = height / 2;
		const step = iconSize + spacing;

		if (layout === 'grid') {
			const cols = Math.max(1, Math.floor((width - spacing) / (iconSize + spacing)));
			const rows = Math.ceil(count / cols);
			const startX = (width - (cols * (iconSize + spacing) - spacing)) / 2;
			const startY = (height - (rows * (iconSize + spacing) - spacing)) / 2;

			return Array.from({ length: count }, (_, i) => ({
				x: startX + (i % cols) * step,
				y: startY + Math.floor(i / cols) * step
			}));
		}

		if (layout === 'square-spiral') {
			const dirs = [
				{ dx: 1, dy: 0 }, { dx: 0, dy: 1 },
				{ dx: -1, dy: 0 }, { dx: 0, dy: -1 }
			];
			const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
			let x = 0, y = 0;
			let dirIdx = 0, stepsInSeg = 0, segLength = 1, segsAtLen = 0;

			while (points.length < count) {
				const d = dirs[dirIdx % 4];
				x += d.dx; y += d.dy;
				points.push({ x, y });
				stepsInSeg++;
				if (stepsInSeg === segLength) {
					stepsInSeg = 0; dirIdx++; segsAtLen++;
					if (segsAtLen === 2) { segsAtLen = 0; segLength++; }
				}
			}

			return points.map(p => ({
				x: centerX + p.x * step,
				y: centerY + p.y * step
			}));
		}

		if (layout === 'hex-spiral') {
			const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
			const dirs = [
				{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 },
				{ dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }
			];
			let ring = 1;
			while (points.length < count) {
				let hx = 0, hy = -ring;
				for (let d = 0; d < 6; d++) {
					const dir = dirs[d];
					for (let s = 0; s < ring; s++) {
						hx += dir.dx; hy += dir.dy;
						points.push({ x: hx, y: hy });
					}
				}
				ring++;
			}

			const rowH = step * 0.866025;
			return points.map(p => ({
				x: centerX + (p.x + p.y * 0.5) * step,
				y: centerY + p.y * rowH
			}));
		}

		if (layout === 'hex-symmetric') {
			const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
			const dirs = [
				{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 },
				{ dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }
			];
			let ring = 1;
			while (points.length < count) {
				const ringPoints: Array<{ x: number; y: number }> = [];
				let hx = 0, hy = -ring;
				for (let d = 0; d < 6; d++) {
					const dir = dirs[d];
					for (let s = 0; s < ring; s++) {
						hx += dir.dx; hy += dir.dy;
						ringPoints.push({ x: hx, y: hy });
					}
				}

				const screenY = (p: { x: number; y: number }) => p.y * 0.866025;
				const used = new Set<string>();
				const pairs: Array<{ top: { x: number; y: number }; bottom: { x: number; y: number }; score: number }> = [];

				for (const p of ringPoints) {
					const key = `${p.x},${p.y}`;
					if (used.has(key)) continue;
					const opp = ringPoints.find(q => q.x === -p.x && q.y === -p.y);
					if (!opp) continue;
					const oppKey = `${opp.x},${opp.y}`;
					used.add(key); used.add(oppKey);

					const score = Math.max(Math.abs(screenY(p)), Math.abs(screenY(opp)));
					const top = screenY(p) < screenY(opp) ? p : opp;
					const bottom = screenY(p) < screenY(opp) ? opp : p;
					pairs.push({ top, bottom, score });
				}

				pairs.sort((a, b) => ring === 1 ? a.score - b.score : b.score - a.score);
				for (const { top, bottom } of pairs) {
					points.push(top, bottom);
				}
				ring++;
			}

			const rowH = step * 0.866025;
			return points.map(p => ({
				x: centerX + (p.x + p.y * 0.5) * step,
				y: centerY + p.y * rowH
			}));
		}

		if (layout === 'arc') {
			const radius = Math.min(width, height) * 0.35;
			const angleStep = (Math.PI * 2) / count;
			return Array.from({ length: count }, (_, i) => {
				const angle = i * angleStep - Math.PI / 2;
				return {
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius
				};
			});
		}

		// fallback: grid
		return Array.from({ length: count }, (_, i) => ({
			x: centerX + (i % 5) * step,
			y: centerY + Math.floor(i / 5) * step
		}));
	}

	function downloadWallpaper() {
		const link = document.createElement('a');
		link.download = `wallicon-${theme.id}-${width}x${height}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}

	// Track previous values to detect what changed
	let prevIconsKey = $state('');
	let prevThemeId = $state('');

	$effect(() => {
		if (!canvas || selectedIcons.length === 0) return;

		void config.layout;
		void config.iconSize;
		void config.spacing;
		void config.opacity;
		void theme.id;
		void shuffleSeed;

		const curKey = selectedIcons.map(i => i.slug).join(',');
		const needsFullReload = curKey !== prevIconsKey || theme.id !== prevThemeId;

		if (needsFullReload) {
			prevIconsKey = curKey;
			prevThemeId = theme.id;
			// Clear image cache for new icons/theme
			imageCache.clear();
		}

		generateWallpaper();
	});

	function shuffleIcons() {
		shuffleSeed++;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3">
		<select
			class="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 focus:border-transparent focus:ring-2 focus:ring-violet-500/40"
			onchange={(e) => {
				const [w, h] = (e.target as HTMLSelectElement).value.split('x').map(Number);
				width = w;
				height = h;
			}}
		>
			<option value="1920x1080">1920 × 1080</option>
			<option value="2560x1440">2560 × 1440</option>
			<option value="3840x2160">3840 × 2160</option>
			<option value="1366x768">1366 × 768</option>
			<option value="1080x1920">1080 × 1920 (Portrait)</option>
			<option value="1080x1080">1080 × 1080 (Square)</option>
		</select>
		<button
			class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={selectedIcons.length === 0}
			onclick={shuffleIcons}
			title="Shuffle icon positions"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		</button>
		<button
			class="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={selectedIcons.length === 0 || isGenerating}
			onclick={downloadWallpaper}
		>
			{#if isGenerating}
				<span class="flex items-center gap-1.5">
					<svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Generating
				</span>
			{:else}
				<span class="flex items-center gap-1.5">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
					Download
				</span>
			{/if}
		</button>
	</div>

	<div class="overflow-hidden rounded-xl border border-white/10 bg-white/5">
		{#if selectedIcons.length === 0}
			<div class="flex h-72 flex-col items-center justify-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
					<svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<p class="text-sm text-gray-500">Select icons to generate your wallpaper</p>
			</div>
		{:else}
			<canvas bind:this={canvas} {width} {height} class="h-auto w-full"></canvas>
		{/if}
	</div>

	{#if selectedIcons.length > 0}
		<div class="flex items-center justify-center gap-1.5 text-xs text-gray-500">
			<span>{selectedIcons.length} icon{selectedIcons.length !== 1 ? 's' : ''}</span>
			<span class="text-gray-700">•</span>
			<span>{config.layout}</span>
			<span class="text-gray-700">•</span>
			<span>{width}×{height}</span>
		</div>
	{/if}
</div>
