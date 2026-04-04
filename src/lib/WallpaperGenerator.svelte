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

	// SVG cache so we only fetch once
	const svgCache = new Map<string, string>();

	async function fetchSvgText(slug: string): Promise<string> {
		const cached = svgCache.get(slug);
		if (cached) return cached;
		const res = await fetch(getIconSvgUrl(slug));
		const text = await res.text();
		svgCache.set(slug, text);
		return text;
	}

	function recolorSvg(svgText: string, accentColor: string): string {
		// Inject fill into the SVG root so paths without explicit fill inherit the accent color.
		// Do NOT touch stroke — adding a stroke where none existed makes icons look bold.
		return svgText
			.replace(/<svg /, `<svg fill="${accentColor}" `)
			.replace(/fill="([^"]*?)"/g, (m, v) => {
				if (v === 'none' || v === 'transparent') return m;
				return `fill="${accentColor}"`;
			});
	}

	function getRandomAccentColor(): string {
		if (!theme.accentColors || theme.accentColors.length === 0) return '#ffffff';
		return theme.accentColors[Math.floor(Math.random() * theme.accentColors.length)];
	}

	async function loadIconImage(icon: Icon): Promise<HTMLImageElement> {
		const svgText = await fetchSvgText(icon.slug);
		const accentColor = getRandomAccentColor();
		const recolored = recolorSvg(svgText, accentColor);
		
		const blob = new Blob([recolored], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(url);
				resolve(img);
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error(`Failed to load icon: ${icon.title}`));
			};
			img.src = url;
		});
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

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw background
		ctx.fillStyle = theme.background;
		ctx.fillRect(0, 0, width, height);

		// Preload all icon images
		const iconImages: HTMLImageElement[] = [];
		for (const icon of selectedIcons) {
			try {
				const img = await loadIconImage(icon);
				iconImages.push(img);
			} catch {
				// Skip icons that fail to load
			}
		}

		// Layout icons
		const { layout, iconSize, spacing } = config;

		if (layout === 'grid') {
			drawGridLayout(ctx, iconImages, iconSize, spacing);
		} else if (layout === 'square-spiral') {
			drawSquareSpiralLayout(ctx, iconImages, iconSize, spacing);
		} else if (layout === 'hex-spiral') {
			drawHexSpiralLayout(ctx, iconImages, iconSize, spacing);
		} else if (layout === 'arc') {
			drawArcLayout(ctx, iconImages, iconSize);
		}

		isGenerating = false;
	}

	function drawGridLayout(
		ctx: CanvasRenderingContext2D,
		iconImages: HTMLImageElement[],
		iconSize: number,
		spacing: number
	) {
		const cols = Math.max(1, Math.floor((width - spacing) / (iconSize + spacing)));
		const rows = Math.ceil(iconImages.length / cols);
		const startX = (width - (cols * (iconSize + spacing) - spacing)) / 2;
		const startY = (height - (rows * (iconSize + spacing) - spacing)) / 2;

		iconImages.forEach((img, i) => {
			const col = i % cols;
			const row = Math.floor(i / cols);
			const x = startX + col * (iconSize + spacing);
			const y = startY + row * (iconSize + spacing);
			drawIcon(ctx, img, x, y, iconSize);
		});
	}

	function drawSquareSpiralLayout(
		ctx: CanvasRenderingContext2D,
		iconImages: HTMLImageElement[],
		iconSize: number,
		spacing: number
	) {
		const centerX = width / 2;
		const centerY = height / 2;
		const step = iconSize + spacing;
		// Generate square spiral: E, S, W, W, N, N, E, E, E, S, S, S, ...
		// Direction cycle: right, down, left, up
		const dirs = [
			{ dx: 1, dy: 0 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 },
			{ dx: 0, dy: -1 }
		];

		const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
		let x = 0, y = 0;
		let dirIdx = 0, stepsInSeg = 0, segLength = 1, segsAtLen = 0;

		while (points.length < iconImages.length) {
			const d = dirs[dirIdx % 4];
			x += d.dx;
			y += d.dy;
			points.push({ x, y });
			stepsInSeg++;

			if (stepsInSeg === segLength) {
				stepsInSeg = 0;
				dirIdx++;
				segsAtLen++;
				if (segsAtLen === 2) {
					segsAtLen = 0;
					segLength++;
				}
			}
		}

		iconImages.forEach((img, i) => {
			const px = centerX + points[i].x * step - iconSize / 2;
			const py = centerY + points[i].y * step - iconSize / 2;
			drawIcon(ctx, img, px, py, iconSize);
		});
	}

	function drawHexSpiralLayout(
		ctx: CanvasRenderingContext2D,
		iconImages: HTMLImageElement[],
		iconSize: number,
		spacing: number
	) {
		const centerX = width / 2;
		const centerY = height / 2;
		const step = iconSize + spacing;
		const rowH = step * 0.866025; // sqrt(3)/2

		// Generate hex ring coordinates: ring 0 = center, ring n = 6*n cells
		const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];

		let ring = 1;
		while (points.length < iconImages.length) {
			// 6 directions for hex ring, each direction walked (ring) times
			const dirs = [
				{ dx: 1, dy: 0 },    // E
				{ dx: 0, dy: 1 },    // SE
				{ dx: -1, dy: 1 },   // SW
				{ dx: -1, dy: 0 },   // W
				{ dx: 0, dy: -1 },   // NW
				{ dx: 1, dy: -1 }    // NE
			];

			let hx = 0, hy = -ring; // Start at top of ring
			for (let d = 0; d < 6; d++) {
				const dir = dirs[d];
				for (let s = 0; s < ring && points.length < iconImages.length; s++) {
					hx += dir.dx;
					hy += dir.dy;
					points.push({ x: hx, y: hy });
				}
			}
			ring++;
		}

		iconImages.forEach((img, i) => {
			// Convert axial hex coords to screen: offset X by y/2 for proper hex layout
			const px = centerX + (points[i].x + points[i].y * 0.5) * step - iconSize / 2;
			const py = centerY + points[i].y * rowH - iconSize / 2;
			drawIcon(ctx, img, px, py, iconSize);
		});
	}

	function drawArcLayout(
		ctx: CanvasRenderingContext2D,
		iconImages: HTMLImageElement[],
		iconSize: number
	) {
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * 0.35;
		const angleStep = (Math.PI * 2) / iconImages.length;

		iconImages.forEach((img, i) => {
			const angle = i * angleStep - Math.PI / 2;
			const x = centerX + Math.cos(angle) * radius - iconSize / 2;
			const y = centerY + Math.sin(angle) * radius - iconSize / 2;
			drawIcon(ctx, img, x, y, iconSize);
		});
	}

	function downloadWallpaper() {
		const link = document.createElement('a');
		link.download = `wallicon-${theme.id}-${width}x${height}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}

	$effect(() => {
		if (canvas && selectedIcons.length > 0) {
			svgCache.clear();
			void config.layout;
			void config.iconSize;
			void config.spacing;
			void config.opacity;
			void theme.id;
			generateWallpaper();
		}
	});
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
