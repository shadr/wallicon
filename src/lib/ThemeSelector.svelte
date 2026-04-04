<script lang="ts">
	import { themes } from '$lib/themes';
	import type { Theme } from '$lib/types';

	interface Props {
		selectedTheme: Theme;
		onSelect: (theme: Theme) => void;
	}

	let { selectedTheme, onSelect }: Props = $props();
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold">Choose a Theme</h3>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each themes as theme}
			<button
				class="relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 {selectedTheme.id === theme.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
				onclick={() => onSelect(theme)}
			>
				<div class="h-24" style="background: {theme.gradient && theme.gradient.length > 0
					? `linear-gradient(135deg, ${theme.gradient.join(', ')})`
					: theme.background}">
				</div>
				<div class="p-3 bg-white dark:bg-gray-800">
					<p class="font-medium text-sm">{theme.name}</p>
					<div class="flex gap-2 mt-2 text-xs text-gray-500">
						<span class="capitalize">{theme.layout}</span>
						<span>•</span>
						<span class="capitalize">{theme.iconStyle}</span>
					</div>
				</div>
				{#if selectedTheme.id === theme.id}
					<div class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
