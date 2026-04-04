<script lang="ts">
	import type { WallpaperConfig, LayoutMode } from '$lib/types';

	interface Props {
		config: WallpaperConfig;
		onChange: (config: WallpaperConfig) => void;
	}

	let { config, onChange }: Props = $props();

	const layouts: { value: LayoutMode; label: string; icon: string }[] = [
		{ value: 'grid', label: 'Grid', icon: '⊞' },
		{ value: 'scatter', label: 'Scatter', icon: '✦' },
		{ value: 'arc', label: 'Arc', icon: '◐' },
		{ value: 'spiral', label: 'Spiral', icon: '◎' }
	];
</script>

<div class="space-y-6">
	<!-- Layout -->
	<div>
		<span id="layout-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
			Layout
		</span>
		<div class="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="layout-label">
			{#each layouts as layout}
				<button
					role="radio"
					aria-checked={config.layout === layout.value}
					class="flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm transition-all {config.layout === layout.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
					onclick={() => onChange({ ...config, layout: layout.value })}
				>
					<span class="text-lg">{layout.icon}</span>
					<span class="text-xs">{layout.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Icon Size -->
	<div>
		<div class="flex items-center justify-between mb-2">
			<label for="icon-size" class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Icon Size
			</label>
			<span class="text-sm text-gray-500">{config.iconSize}px</span>
		</div>
		<input
			id="icon-size"
			type="range"
			min="40"
			max="200"
			step="10"
			bind:value={config.iconSize}
			oninput={() => onChange({ ...config })}
			class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
		/>
	</div>

	<!-- Spacing -->
	<div>
		<div class="flex items-center justify-between mb-2">
			<label for="spacing" class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Spacing
			</label>
			<span class="text-sm text-gray-500">{config.spacing}px</span>
		</div>
		<input
			id="spacing"
			type="range"
			min="0"
			max="80"
			step="5"
			bind:value={config.spacing}
			oninput={() => onChange({ ...config })}
			class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
		/>
	</div>

	<!-- Opacity -->
	<div>
		<div class="flex items-center justify-between mb-2">
			<label for="opacity-slider" class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Opacity
			</label>
			<span class="text-sm text-gray-500">{Math.round(config.opacity * 100)}%</span>
		</div>
		<input
			id="opacity-slider"
			type="range"
			min="0.1"
			max="1"
			step="0.05"
			bind:value={config.opacity}
			oninput={() => onChange({ ...config })}
			class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
		/>
	</div>
</div>
