<script lang="ts">
	import type { Icon, Theme, WallpaperConfig, LayoutMode } from '$lib/types';
	import { getIconSvgUrl } from '$lib/icons';
	import ColorAssignmentWorker from '$lib/workers/colorAssignment.worker?worker';

	interface Props {
		selectedIcons: Icon[];
		theme: Theme;
		config: WallpaperConfig;
		width?: number;
		height?: number;
	}

	let { selectedIcons, theme, config, width = 1920, height = 1080 }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let isGenerating = $state(false);
	let shuffleSeed = $state(0);

	// Token to cancel stale async generations (plain let, NOT $state — avoids self-triggering $effect)
	let generationCounter = 0;

	// Persistent caches — survive across renders
	const svgTextCache = new Map<string, string>();
	const imageCache = new Map<string, Map<string, HTMLImageElement>>();

	// Assign colors to maximize sum of pairwise distances between same-colored icons
	async function assignColors(
		positions: Array<{ x: number; y: number }>,
		colors: string[]
	): Promise<string[]> {
		// Use one-shot worker for larger datasets to avoid blocking main thread
		if (positions.length > 50) {
			const worker = new ColorAssignmentWorker();
			return new Promise<string[]>((resolve, reject) => {
				worker.onmessage = (e: MessageEvent<{ result: string[]; error?: string }>) => {
					worker.terminate();
					if (e.data.error) {
						reject(new Error(`Color assignment worker error: ${e.data.error}`));
					} else {
						resolve(e.data.result);
					}
				};
				worker.onerror = (err: ErrorEvent) => {
					worker.terminate();
					reject(new Error(`Color assignment worker failed: ${err.message}`));
				};
				worker.postMessage({ positions, colors });
			});
		}

		// Fallback to main thread for small datasets (avoid worker overhead)
		return assignColorsSync(positions, colors);
	}

	// Synchronous color assignment for small datasets
	// Optimized: squared distances, typed arrays, no sqrt
	function assignColorsSync(
		positions: Array<{ x: number; y: number }>,
		colors: string[]
	): string[] {
		const n = positions.length;
		const k = colors.length;
		if (k === 0) return Array(n).fill('#ffffff');
		if (k >= n) {
			const result: string[] = new Array(n);
			for (let i = 0; i < n; i++) result[i] = colors[i];
			return result;
		}

		// Flatten positions for cache locality
		const px = new Float64Array(n);
		const py = new Float64Array(n);
		for (let i = 0; i < n; i++) {
			px[i] = positions[i].x;
			py[i] = positions[i].y;
		}

		const assigned = new Uint8Array(n);
		const resultColorIdx = new Int16Array(n).fill(-1);
		const colorAssignments: number[][] = colors.map(() => []);
		let remaining = n;
		const assignmentsPerColor = Math.ceil(n / k);

		for (let round = 0; round < assignmentsPerColor && remaining > 0; round++) {
			for (let colorIdx = 0; colorIdx < k && remaining > 0; colorIdx++) {
				const assignedPositions = colorAssignments[colorIdx];
				const numAssigned = assignedPositions.length;

				if (numAssigned === 0) {
					// First assignment: pick first available position
					for (let p = 0; p < n; p++) {
						if (!assigned[p]) {
							assigned[p] = 1;
							resultColorIdx[p] = colorIdx;
							assignedPositions.push(p);
							remaining--;
							break;
						}
					}
					continue;
				}

				let bestPos = -1;
				let bestMinDistSq = -1;

				for (let p = 0; p < n; p++) {
					if (assigned[p]) continue;

					let minD = Infinity;
					for (let a = 0; a < numAssigned; a++) {
						const cp = assignedPositions[a];
						const dx = px[p] - px[cp];
						const dy = py[p] - py[cp];
						const dSq = dx * dx + dy * dy;
						if (dSq < minD) minD = dSq;
					}

					if (minD > bestMinDistSq) {
						bestMinDistSq = minD;
						bestPos = p;
					}
				}

				if (bestPos !== -1) {
					assigned[bestPos] = 1;
					resultColorIdx[bestPos] = colorIdx;
					assignedPositions.push(bestPos);
					remaining--;
				}
			}
		}

		const result: string[] = new Array(n);
		for (let i = 0; i < n; i++) {
			result[i] = resultColorIdx[i] >= 0 ? colors[resultColorIdx[i]] : '#ffffff';
		}
		return result;
	}

	async function loadIconWithColor(
		icon: { slug: string },
		color: string
	): Promise<HTMLImageElement> {
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
			.replace(/<svg(\s|>)/, `<svg fill="${color}"$1`)
			.replace(/fill="([^"]*?)"/g, (m, v) => {
				if (v === 'none' || v === 'transparent') return m;
				return `fill="${color}"`;
			});

		const blob = new Blob([recolored], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const i = new Image();
			i.onload = () => {
				URL.revokeObjectURL(url);
				resolve(i);
			};
			i.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error(icon.slug));
			};
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
		// Load all images in parallel for maximum performance
		const promises = icons.map((icon, i) => loadIconWithColor(icon, colors[i]));
		return await Promise.all(promises);
	}

	function drawIcon(
		ctx: CanvasRenderingContext2D,
		img: HTMLImageElement,
		x: number,
		y: number,
		size: number,
		opacity: number
	) {
		ctx.globalAlpha = opacity;
		ctx.drawImage(img, x, y, size, size);
	}

	async function generateWallpaper(token: number) {
		if (selectedIcons.length === 0) return;
		if (!canvas) return;

		isGenerating = true;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			isGenerating = false;
			return;
		}

		try {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = theme.background;
			ctx.fillRect(0, 0, width, height);

			const { layout, iconSize, spacing, opacity } = config;

			// Shuffle icons if seed is non-zero
			const shuffled = shuffleSeed > 0 ? [...selectedIcons] : selectedIcons;
			if (shuffleSeed > 0) {
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

			// 1. Compute positions — may return fewer than requested if layout can't fit them all
			const positions = computePositions(layout, shuffled.length, iconSize, spacing);

			// Truncate icons to fit available positions
			const usableIcons =
				positions.length < shuffled.length ? shuffled.slice(0, positions.length) : shuffled;

			// 2. Assign colors to maximize same-color distances (async with worker)
			const colors = await assignColors(positions, theme.accentColors);

			// 3. Load images with assigned colors (in parallel)
			const iconImages = await loadAllImages(usableIcons, colors);

			// Bail if a newer generation was triggered
			if (token !== generationCounter) return;

			// 4. Draw all icons in batch
			for (let i = 0; i < iconImages.length; i++) {
				const px = positions[i].x - iconSize / 2;
				const py = positions[i].y - iconSize / 2;
				drawIcon(ctx, iconImages[i], px, py, iconSize, opacity);
			}
		} catch (error) {
			console.error('Failed to generate wallpaper:', error);
		} finally {
			isGenerating = false;
		}
	}

	function computePositions(
		layout: LayoutMode,
		count: number,
		iconSize: number,
		spacing: number
	): Array<{ x: number; y: number }> {
		const halfIcon = iconSize / 2;
		const margin = spacing;
		const minX = margin + halfIcon;
		const minY = margin + halfIcon;
		const maxX = width - margin - halfIcon;
		const maxY = height - margin - halfIcon;
		const centerX = width / 2;
		const centerY = height / 2;
		const step = iconSize + spacing;

		// Hard cap: max positions that could physically fit in canvas area
		const maxPositions = Math.ceil((width / step) * (height / step)) + 100;
		const cappedCount = Math.min(count, maxPositions);

		function inBounds(x: number, y: number): boolean {
			return x >= minX && x <= maxX && y >= minY && y <= maxY;
		}

		if (layout === 'grid') {
			const cols = Math.max(1, Math.floor((width - 2 * margin) / step));
			const rows = Math.ceil(cappedCount / cols);
			const gridW = cols * step - spacing;
			const gridH = rows * step - spacing;
			const startX = (width - gridW) / 2;
			const startY = (height - gridH) / 2;

			return Array.from({ length: cappedCount }, (_, i) => ({
				x: startX + (i % cols) * step,
				y: startY + Math.floor(i / cols) * step
			}));
		}

		if (layout === 'square-spiral') {
			const dirs = [
				{ dx: 1, dy: 0 },
				{ dx: 0, dy: 1 },
				{ dx: -1, dy: 0 },
				{ dx: 0, dy: -1 }
			];
			const validPoints: Array<{ x: number; y: number }> = [];
			let x = 0,
				y = 0;
			let dirIdx = 0,
				stepsInSeg = 0,
				segLength = 1,
				segsAtLen = 0;

			// Center point
			const cx = centerX,
				cy = centerY;
			if (inBounds(cx, cy)) validPoints.push({ x: cx, y: cy });

			let pointsThisRing = 0;
			let ringSinceLastValid = 0;
			const maxRingsWithoutFit = 5; // break early if 5 rings produce nothing

			while (validPoints.length < cappedCount && ringSinceLastValid < maxRingsWithoutFit) {
				const d = dirs[dirIdx % 4];
				x += d.dx;
				y += d.dy;
				const px = centerX + x * step;
				const py = centerY + y * step;
				if (inBounds(px, py)) {
					validPoints.push({ x: px, y: py });
					pointsThisRing++;
				}
				stepsInSeg++;
				if (stepsInSeg === segLength) {
					stepsInSeg = 0;
					dirIdx++;
					segsAtLen++;
					if (segsAtLen === 2) {
						segsAtLen = 0;
						segLength++;
						// Ring completed
						if (pointsThisRing === 0) {
							ringSinceLastValid++;
						} else {
							ringSinceLastValid = 0;
							pointsThisRing = 0;
						}
					}
				}
			}

			return validPoints.slice(0, cappedCount);
		}

		if (layout === 'hex-spiral') {
			const validPoints: Array<{ x: number; y: number }> = [];
			const dirs = [
				{ dx: 1, dy: 0 },
				{ dx: 0, dy: 1 },
				{ dx: -1, dy: 1 },
				{ dx: -1, dy: 0 },
				{ dx: 0, dy: -1 },
				{ dx: 1, dy: -1 }
			];
			const rowH = step * 0.866025;

			// Center point
			if (inBounds(centerX, centerY)) validPoints.push({ x: centerX, y: centerY });

			let ring = 1;
			let ringSinceLastValid = 0;
			const maxRingsWithoutFit = 5;

			while (validPoints.length < cappedCount && ringSinceLastValid < maxRingsWithoutFit) {
				let ringValidCount = 0;
				let hx = 0,
					hy = -ring;
				for (let d = 0; d < 6; d++) {
					const dir = dirs[d];
					for (let s = 0; s < ring; s++) {
						hx += dir.dx;
						hy += dir.dy;
						const px = centerX + (hx + hy * 0.5) * step;
						const py = centerY + hy * rowH;
						if (inBounds(px, py)) {
							validPoints.push({ x: px, y: py });
							ringValidCount++;
						}
					}
				}
				if (ringValidCount === 0) {
					ringSinceLastValid++;
				} else {
					ringSinceLastValid = 0;
				}
				ring++;
			}

			return validPoints.slice(0, cappedCount);
		}

		if (layout === 'hex-symmetric') {
			const validPoints: Array<{ x: number; y: number }> = [];
			const dirs = [
				{ dx: 1, dy: 0 },
				{ dx: 0, dy: 1 },
				{ dx: -1, dy: 1 },
				{ dx: -1, dy: 0 },
				{ dx: 0, dy: -1 },
				{ dx: 1, dy: -1 }
			];
			const rowH = step * 0.866025;

			// Center point
			if (inBounds(centerX, centerY)) validPoints.push({ x: centerX, y: centerY });

			let ring = 1;
			let ringSinceLastValid = 0;
			const maxRingsWithoutFit = 5;

			while (validPoints.length < cappedCount && ringSinceLastValid < maxRingsWithoutFit) {
				const ringPoints: Array<{ x: number; y: number }> = [];
				let hx = 0,
					hy = -ring;
				for (let d = 0; d < 6; d++) {
					const dir = dirs[d];
					for (let s = 0; s < ring; s++) {
						hx += dir.dx;
						hy += dir.dy;
						ringPoints.push({ x: hx, y: hy });
					}
				}

				const screenY = (p: { x: number; y: number }) => p.y * 0.866025;
				const used = new Set<string>();
				const pairs: Array<{
					top: { x: number; y: number };
					bottom: { x: number; y: number };
					score: number;
				}> = [];

				for (const p of ringPoints) {
					const key = `${p.x},${p.y}`;
					if (used.has(key)) continue;
					const opp = ringPoints.find((q) => q.x === -p.x && q.y === -p.y);
					if (!opp) continue;
					const oppKey = `${opp.x},${opp.y}`;
					used.add(key);
					used.add(oppKey);

					const score = Math.max(Math.abs(screenY(p)), Math.abs(screenY(opp)));
					const top = screenY(p) < screenY(opp) ? p : opp;
					const bottom = screenY(p) < screenY(opp) ? opp : p;
					pairs.push({ top, bottom, score });
				}

				pairs.sort((a, b) => (ring === 1 ? a.score - b.score : b.score - a.score));
				let ringValidCount = 0;
				for (const { top, bottom } of pairs) {
					const ptx = centerX + (top.x + top.y * 0.5) * step;
					const pty = centerY + top.y * rowH;
					if (inBounds(ptx, pty)) {
						validPoints.push({ x: ptx, y: pty });
						ringValidCount++;
					}
					if (validPoints.length >= cappedCount) break;
					const pbx = centerX + (bottom.x + bottom.y * 0.5) * step;
					const pby = centerY + bottom.y * rowH;
					if (inBounds(pbx, pby)) {
						validPoints.push({ x: pbx, y: pby });
						ringValidCount++;
					}
				}
				if (ringValidCount === 0) {
					ringSinceLastValid++;
				} else {
					ringSinceLastValid = 0;
				}
				ring++;
			}

			return validPoints.slice(0, cappedCount);
		}

		if (layout === 'arc') {
			const radius = Math.min(width, height) * 0.35;
			const angleStep = (Math.PI * 2) / cappedCount;
			return Array.from({ length: cappedCount }, (_, i) => {
				const angle = i * angleStep - Math.PI / 2;
				return {
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius
				};
			});
		}

		// fallback: grid
		return Array.from({ length: cappedCount }, (_, i) => ({
			x: centerX + (i % 5) * step,
			y: centerY + Math.floor(i / 5) * step
		}));
	}

	function downloadWallpaper() {
		if (!canvas) return;
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

		const token = ++generationCounter;
		const curKey = selectedIcons.map((i) => i.slug).join(',');
		const needsFullReload = curKey !== prevIconsKey || theme.id !== prevThemeId;

		if (needsFullReload) {
			prevIconsKey = curKey;
			prevThemeId = theme.id;
			imageCache.clear();
		}

		generateWallpaper(token);
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
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
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
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
							fill="none"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Generating
				</span>
			{:else}
				<span class="flex items-center gap-1.5">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
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
					<svg
						class="h-6 w-6 text-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<p class="text-sm text-gray-500">Select icons to generate your wallpaper</p>
			</div>
		{:else}
			<canvas
				bind:this={canvas}
				{width}
				{height}
				class="h-auto w-full"
				aria-label="Generated wallpaper preview"
			></canvas>
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
