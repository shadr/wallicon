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
	<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
		{#each themes as theme}
			<button
				class="relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 {selectedTheme.id === theme.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
				onclick={() => onSelect(theme)}
			>
				<div
					class="h-16"
					style="background: {theme.gradient && theme.gradient.length > 0
						? `linear-gradient(135deg, ${theme.gradient.join(', ')})`
						: theme.background}"
				></div>
				<div class="p-2 bg-white dark:bg-gray-800">
					<p class="text-xs font-medium">{theme.name}</p>
				</div>
				{#if selectedTheme.id === theme.id}
					<div class="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
