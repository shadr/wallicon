<script lang="ts">
	import type { WallpaperConfig, LayoutMode, IconStyle } from '$lib/types';

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

	const iconStyles: { value: IconStyle; label: string }[] = [
		{ value: 'none', label: 'None' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'rounded', label: 'Rounded' },
		{ value: 'square', label: 'Square' }
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

	<!-- Icon Style -->
	<div>
		<span id="shape-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
			Icon Shape
		</span>
		<div class="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="shape-label">
			{#each iconStyles as style}
				<button
					role="radio"
					aria-checked={config.iconStyle === style.value}
					class="flex items-center justify-center rounded-lg border-2 p-2.5 text-sm transition-all {config.iconStyle === style.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
					onclick={() => onChange({ ...config, iconStyle: style.value })}
				>
					{#if style.value === 'none'}
						<span class="text-xs">None</span>
					{:else if style.value === 'circle'}
						<span class="inline-block w-4 h-4 rounded-full border-2 border-current"></span>
					{:else if style.value === 'rounded'}
						<span class="inline-block w-4 h-4 rounded border-2 border-current" style="border-radius: 20%;"></span>
					{:else if style.value === 'square'}
						<span class="inline-block w-4 h-4 border-2 border-current"></span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Icon Size -->
	<div>
		<div class="flex items-center justify-between mb-2">
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Icon Size
			</label>
			<span class="text-sm text-gray-500">{config.iconSize}px</span>
		</div>
		<input
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
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Spacing
			</label>
			<span class="text-sm text-gray-500">{config.spacing}px</span>
		</div>
		<input
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
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Opacity
			</label>
			<span class="text-sm text-gray-500">{Math.round(config.opacity * 100)}%</span>
		</div>
		<input
			type="range"
			min="0.1"
			max="1"
			step="0.05"
			bind:value={config.opacity}
			oninput={() => onChange({ ...config })}
			class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
		/>
	</div>

	<!-- Rotation Toggle -->
	<div>
		<button
			class="flex items-center justify-between w-full rounded-lg border-2 p-3 transition-all {config.rotation ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
			onclick={() => onChange({ ...config, rotation: !config.rotation })}
		>
			<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Random Rotation</span>
			<div class="w-10 h-6 rounded-full transition-colors {config.rotation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} relative">
				<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform {config.rotation ? 'translate-x-4' : ''}"></div>
			</div>
		</button>
	</div>
</div>
