<script lang="ts">
	import type { Icon } from '$lib/types';
	import type { Theme } from '$lib/types';

	interface Props {
		selectedIcons: Icon[];
		theme: Theme;
		width?: number;
		height?: number;
	}

	let { selectedIcons, theme, width = 1920, height = 1080 }: Props = $props();

	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let isGenerating = $state(false);

	async function loadIconImage(icon: Icon): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const svgBlob = new Blob([icon.svg], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(svgBlob);
			const img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(url);
				resolve(img);
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error(`Failed to load icon: ${icon.name}`));
			};
			img.src = url;
		});
	}

	function drawIcon(
		ctx: CanvasRenderingContext2D,
		img: HTMLImageElement,
		x: number,
		y: number,
		size: number,
		icon: Icon
	) {
		ctx.save();

		// Apply icon style clipping
		if (theme.iconStyle === 'circle') {
			ctx.beginPath();
			ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
			ctx.clip();
		} else if (theme.iconStyle === 'rounded') {
			const radius = size * 0.2;
			ctx.beginPath();
			ctx.roundRect(x, y, size, size, radius);
			ctx.clip();
		} else if (theme.iconStyle === 'square') {
			ctx.beginPath();
			ctx.rect(x, y, size, size);
			ctx.clip();
		}

		// Apply opacity and draw
		ctx.globalAlpha = theme.opacity ?? 1;
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
		if (theme.gradient && theme.gradient.length > 0) {
			const gradient = ctx.createLinearGradient(0, 0, width, height);
			theme.gradient.forEach((color, i) => {
				gradient.addColorStop(i / (theme.gradient!.length - 1), color);
			});
			ctx.fillStyle = gradient;
		} else {
			ctx.fillStyle = theme.background;
		}
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
		const layout = theme.layout;
		const iconSize = theme.gridSize ?? 100;
		const spacing = theme.spacing ?? 20;

		if (layout === 'grid') {
			drawGridLayout(ctx, iconImages, iconSize, spacing);
		} else if (layout === 'scatter') {
			drawScatterLayout(ctx, iconImages, iconSize);
		} else if (layout === 'arc') {
			drawArcLayout(ctx, iconImages, iconSize);
		} else if (layout === 'spiral') {
			drawSpiralLayout(ctx, iconImages, iconSize);
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
			drawIcon(ctx, img, x, y, iconSize, selectedIcons[i]);
		});
	}

	function drawScatterLayout(
		ctx: CanvasRenderingContext2D,
		iconImages: HTMLImageElement[],
		iconSize: number
	) {
		const centerX = width / 2;
		const centerY = height / 2;
		const scatterRadius = Math.min(width, height) * 0.35;
		const minDist = iconSize * 1.4;
		const positions: Array<{ x: number; y: number }> = [];
		const rng = seededRandom(Date.now());

		iconImages.forEach((img, i) => {
			let x: number, y: number;
			let attempts = 0;
			let valid = false;

			while (!valid && attempts < 300) {
				const angle = rng() * Math.PI * 2;
				const radius = rng() * scatterRadius;
				x = centerX + Math.cos(angle) * radius - iconSize / 2;
				y = centerY + Math.sin(angle) * radius - iconSize / 2;

				valid = true;
				for (const pos of positions) {
					const dx = x - pos.x;
					const dy = y - pos.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < minDist) {
						valid = false;
						break;
					}
				}
				attempts++;
			}

			if (valid) {
				positions.push({ x: x!, y: y! });

				ctx.save();
				if (theme.rotation) {
					const angle = ((rng() - 0.5) * Math.PI) / 4;
					ctx.translate(x! + iconSize / 2, y! + iconSize / 2);
					ctx.rotate(angle);
					ctx.translate(-(x! + iconSize / 2), -(y! + iconSize / 2));
				}
				drawIcon(ctx, img, x!, y!, iconSize, selectedIcons[i]);
				ctx.restore();
			}
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
			drawIcon(ctx, img, x, y, iconSize, selectedIcons[i]);
		});
	}

	function drawSpiralLayout(
		ctx: CanvasRenderingContext2D,
		iconImages: HTMLImageElement[],
		iconSize: number
	) {
		const centerX = width / 2;
		const centerY = height / 2;
		const maxRadius = Math.min(width, height) * 0.4;

		iconImages.forEach((img, i) => {
			const t = iconImages.length === 1 ? 0 : i / (iconImages.length - 1);
			const angle = t * Math.PI * 6;
			const radius = t * maxRadius;
			const x = centerX + Math.cos(angle) * radius - iconSize / 2;
			const y = centerY + Math.sin(angle) * radius - iconSize / 2;
			drawIcon(ctx, img, x, y, iconSize, selectedIcons[i]);
		});
	}

	function seededRandom(seed: number) {
		return () => {
			seed = (seed * 16807 + 0) % 2147483647;
			return (seed - 1) / 2147483646;
		};
	}

	function downloadWallpaper() {
		const link = document.createElement('a');
		link.download = `wallicon-${theme.id}-${width}x${height}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}

	$effect(() => {
		if (canvas && selectedIcons.length > 0) {
			generateWallpaper();
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Preview</h3>
		<div class="flex gap-2">
			<select
				class="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
				onchange={(e) => {
					const [w, h] = (e.target as HTMLSelectElement).value.split('x').map(Number);
					width = w;
					height = h;
				}}
			>
				<option value="1920x1080">1920×1080</option>
				<option value="2560x1440">2560×1440</option>
				<option value="3840x2160">3840×2160</option>
				<option value="1366x768">1366×768</option>
				<option value="1080x1920">1080×1920 (Portrait)</option>
				<option value="1080x1080">1080×1080 (Square)</option>
			</select>
			<button
				class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={selectedIcons.length === 0 || isGenerating}
				onclick={downloadWallpaper}
			>
				{#if isGenerating}
					<span class="flex items-center gap-2">
						<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
						Generating...
					</span>
				{:else}
					Download PNG
				{/if}
			</button>
		</div>
	</div>

	<div class="overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700">
		{#if selectedIcons.length === 0}
			<div class="flex h-96 items-center justify-center bg-gray-100 dark:bg-gray-800">
				<p class="text-gray-500">Select some icons to generate your wallpaper</p>
			</div>
		{:else}
			<canvas bind:this={canvas} {width} {height} class="h-auto w-full"></canvas>
		{/if}
	</div>

	{#if selectedIcons.length > 0}
		<p class="text-center text-sm text-gray-500">
			{selectedIcons.length} icon{selectedIcons.length !== 1 ? 's' : ''} • {theme.name} • {width}×{height}
		</p>
	{/if}
</div>
