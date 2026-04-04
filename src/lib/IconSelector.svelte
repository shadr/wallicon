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
			class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-violet-500/40 sm:flex-1"
		/>
	</div>

	{#if selectedIcons.length > 0}
		<div class="flex flex-wrap gap-1">
			{#each selectedIcons as icon}
				<span class="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-violet-500/20">
					{icon.title}
					<button
						class="ml-0.5 text-violet-300 hover:text-violet-200"
						onclick={() => onToggle(icon)}
					>
						&times;
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<div class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 xl:grid-cols-8">
		{#each displayedIcons as icon}
			<button
				class="group relative rounded-lg border border-white/10 bg-white/5 p-2.5 transition-all hover:border-white/20 hover:bg-white/10 {isSelected(icon.slug) ? 'border-violet-500/50 bg-violet-500/10' : ''}"
				onclick={() => handleToggle(icon)}
			>
				<div class="aspect-square mb-1.5 flex items-center justify-center">
					<img
						src={getIconSvgUrl(icon.slug)}
						alt={icon.title}
						class="h-full w-full object-contain"
						loading="lazy"
					/>
				</div>
				<p class="text-[10px] font-medium text-center truncate text-gray-400 group-hover:text-gray-300">{icon.title}</p>
				{#if isSelected(icon.slug)}
					<div class="absolute top-1 right-1 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center">
						<svg class="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	{#if !isSearching && searchQuery.length === 0 && currentPage < totalPages - 1}
		<div class="flex justify-center">
			<button
				class="rounded-lg bg-white/5 px-5 py-2 text-sm text-gray-400 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-gray-300"
				onclick={loadMore}
			>
				Load more ({displayedIcons.length} of {totalIcons} shown)
			</button>
		</div>
	{/if}

	{#if displayedIcons.length === 0 && !isSearching}
		<div class="py-12 text-center text-gray-500">
			<p>No icons found</p>
		</div>
	{/if}
</div>
