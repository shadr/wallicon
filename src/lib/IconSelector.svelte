<script lang="ts">
	import { allIcons, getIconPage, searchIcons, totalIcons, getIconSvgUrl } from '$lib/icons';
	import type { Icon } from '$lib/types';

	const ICONS_PER_PAGE = 60;

	interface Props {
		selectedIcons: Icon[];
		onToggle: (icon: Omit<Icon, 'svg'>) => void;
	}

	let { selectedIcons, onToggle }: Props = $props();

	let searchQuery = $state('');
	let currentPage = $state(0);
	let displayedIcons = $state<Omit<Icon, 'svg'>[]>([]);
	let isSearching = $state(false);
	const totalPages = Math.ceil(totalIcons / ICONS_PER_PAGE);

	$effect(() => {
		if (searchQuery.length > 0) {
			isSearching = true;
			displayedIcons = searchIcons(searchQuery);
			currentPage = 0;
			isSearching = false;
		} else {
			displayedIcons = getIconPage(currentPage);
		}
	});

	function isSelected(slug: string): boolean {
		return selectedIcons.some((i) => i.id === slug);
	}

	function handleToggle(icon: Omit<Icon, 'svg'>) {
		onToggle(icon);
	}

	function loadMore() {
		if (searchQuery.length > 0) return;
		if (currentPage < totalPages - 1) {
			currentPage++;
			displayedIcons = [...displayedIcons, ...getIconPage(currentPage)];
		}
	}
</script>

<div class="space-y-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<input
			type="text"
			placeholder="Search {totalIcons} icons..."
			bind:value={searchQuery}
			class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:flex-1"
		/>
	</div>

	{#if selectedIcons.length > 0}
		<div class="flex flex-wrap gap-1">
			{#each selectedIcons as icon}
				<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
					{icon.title}
					<button
						class="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
						onclick={() => onToggle(icon)}
					>
						&times;
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
		{#each displayedIcons as icon}
			<button
				class="relative p-3 rounded-xl border-2 transition-all hover:scale-105 {isSelected(icon.slug) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
				onclick={() => handleToggle(icon)}
			>
				<div class="aspect-square mb-1 flex items-center justify-center">
					<img
						src={getIconSvgUrl(icon.slug)}
						alt={icon.title}
						class="w-full h-full object-contain"
						style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));"
						loading="lazy"
					/>
				</div>
				<p class="text-[10px] font-medium text-center truncate text-gray-700 dark:text-gray-300">{icon.title}</p>
				{#if isSelected(icon.slug)}
					<div class="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	{#if !isSearching && searchQuery.length === 0 && currentPage < totalPages - 1}
		<div class="text-center">
			<button
				class="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
				onclick={loadMore}
			>
				Load more ({displayedIcons.length} of {totalIcons} shown)
			</button>
		</div>
	{/if}

	{#if displayedIcons.length === 0 && !isSearching}
		<div class="text-center py-12 text-gray-500">
			<p>No icons found</p>
		</div>
	{/if}
</div>
