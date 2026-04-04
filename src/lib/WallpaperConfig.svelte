<script lang="ts">
	import type { WallpaperConfig, LayoutMode } from '$lib/types';

	interface Props {
		config: WallpaperConfig;
		onChange: (config: WallpaperConfig) => void;
	}

	let { config, onChange }: Props = $props();

	const layouts: { value: LayoutMode; label: string; icon: string }[] = [
		{ value: 'grid', label: 'Grid', icon: '⊞' },
		{ value: 'square-spiral', label: 'Sq Spiral', icon: '⊡' },
		{ value: 'hex-spiral', label: 'Hex Spiral', icon: '⬡' },
		{ value: 'hex-symmetric', label: 'Hex Symmetric', icon: '❋' },
		{ value: 'arc', label: 'Arc', icon: '◐' }
	];
</script>

<div class="space-y-5">
	<!-- Layout -->
	<div>
		<span id="layout-label" class="mb-2 block text-xs font-medium text-gray-400">
			Layout
		</span>
		<div class="grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby="layout-label">
			{#each layouts as layout}
				<button
					role="radio"
					aria-checked={config.layout === layout.value}
					class="flex flex-col items-center gap-1 rounded-lg border p-2.5 text-sm transition-all {config.layout === layout.value ? 'border-violet-500/50 bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'}"
					onclick={() => onChange({ ...config, layout: layout.value })}
				>
					<span class="text-base">{layout.icon}</span>
					<span class="text-[10px]">{layout.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Icon Size -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label for="icon-size" class="text-xs font-medium text-gray-400">
				Icon Size
			</label>
			<span class="text-xs font-mono text-gray-500">{config.iconSize}px</span>
		</div>
		<input
			id="icon-size"
			type="range"
			min="40"
			max="200"
			step="10"
			bind:value={config.iconSize}
			oninput={() => onChange({ ...config })}
			class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
		/>
	</div>

	<!-- Spacing -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label for="spacing" class="text-xs font-medium text-gray-400">
				Spacing
			</label>
			<span class="text-xs font-mono text-gray-500">{config.spacing}px</span>
		</div>
		<input
			id="spacing"
			type="range"
			min="0"
			max="80"
			step="5"
			bind:value={config.spacing}
			oninput={() => onChange({ ...config })}
			class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
		/>
	</div>

	<!-- Opacity -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label for="opacity-slider" class="text-xs font-medium text-gray-400">
				Opacity
			</label>
			<span class="text-xs font-mono text-gray-500">{Math.round(config.opacity * 100)}%</span>
		</div>
		<input
			id="opacity-slider"
			type="range"
			min="0.1"
			max="1"
			step="0.05"
			bind:value={config.opacity}
			oninput={() => onChange({ ...config })}
			class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
		/>
	</div>
</div>
