<script lang="ts">
	import { themes } from '$lib/themes';
	import type { Theme } from '$lib/types';

	const THEMES_PER_PAGE = 24;

	interface Props {
		selectedTheme: Theme;
		onSelect: (theme: Theme) => void;
	}

	let { selectedTheme, onSelect }: Props = $props();

	let searchQuery = $state('');
	let currentPage = $state(0);

	const filteredThemes = $derived(
		searchQuery.length > 0
			? themes.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: themes
	);

	const totalPages = $derived(Math.ceil(filteredThemes.length / THEMES_PER_PAGE));
	const visibleThemes = $derived(
		filteredThemes.slice(0, (currentPage + 1) * THEMES_PER_PAGE)
	);

	function selectTheme(theme: Theme) {
		onSelect(theme);
	}
</script>

<div class="space-y-4">
	<input
		type="text"
		placeholder="Search {themes.length} themes..."
		bind:value={searchQuery}
		oninput={() => currentPage = 0}
		class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-violet-500/40"
	/>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
		{#each visibleThemes as theme}
			<button
				class="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10 {selectedTheme.id === theme.id ? 'border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/20' : ''}"
				onclick={() => selectTheme(theme)}
			>
				<div class="h-8 flex" style="background: {theme.background}">
					{#each theme.accentColors.slice(0, 6) as color}
						<div class="flex-1" style="background: {color}"></div>
					{/each}
				</div>
				<div class="bg-[#0e1117]/50 p-1.5">
					<p class="text-[10px] font-medium truncate text-gray-400 group-hover:text-gray-300">{theme.name}</p>
				</div>
				{#if selectedTheme.id === theme.id}
					<div class="absolute top-1 right-1 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center">
						<svg class="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	{#if currentPage < totalPages - 1 && searchQuery.length === 0}
		<div class="flex justify-center">
			<button
				class="rounded-lg bg-white/5 px-4 py-1.5 text-sm text-gray-400 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-gray-300"
				onclick={() => currentPage++}
			>
				Load more ({visibleThemes.length} of {filteredThemes.length} shown)
			</button>
		</div>
	{/if}

	{#if filteredThemes.length === 0}
		<div class="py-8 text-center text-gray-500">
			<p>No themes found</p>
		</div>
	{/if}
</div>
