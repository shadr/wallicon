<script lang="ts">
	import { icons, categories } from '$lib/icons';
	import type { Icon } from '$lib/types';

	interface Props {
		selectedIcons: Icon[];
		onToggle: (icon: Icon) => void;
	}

	let { selectedIcons, onToggle }: Props = $props();

	let activeCategory = $state<string>('All');
	let searchQuery = $state('');

	const filteredIcons = $derived(
		icons.filter(icon => {
			const matchesCategory = activeCategory === 'All' || icon.category === activeCategory;
			const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);

	function isSelected(icon: Icon): boolean {
		return selectedIcons.some(i => i.id === icon.id);
	}
</script>

<div class="space-y-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-wrap gap-2">
			<button
				class="px-3 py-1.5 text-sm rounded-full transition-colors {activeCategory === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}"
				onclick={() => activeCategory = 'All'}
			>
				All
			</button>
			{#each categories as category}
				<button
					class="px-3 py-1.5 text-sm rounded-full transition-colors {activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					onclick={() => activeCategory = category}
				>
					{category}
				</button>
			{/each}
		</div>
		<input
			type="text"
			placeholder="Search icons..."
			bind:value={searchQuery}
			class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
		{#each filteredIcons as icon}
			<button
				class="relative p-4 rounded-xl border-2 transition-all hover:scale-105 {isSelected(icon) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
				onclick={() => onToggle(icon)}
			>
				<div class="aspect-square mb-2">
					{@html icon.svg}
				</div>
				<p class="text-sm font-medium text-center truncate">{icon.name}</p>
				{#if isSelected(icon)}
					<div class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	{#if filteredIcons.length === 0}
		<div class="text-center py-12 text-gray-500">
			<p>No icons found</p>
		</div>
	{/if}
</div>
