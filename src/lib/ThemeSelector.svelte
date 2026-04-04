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
		class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500"
	/>

	<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
		{#each visibleThemes as theme}
			<button
				class="group relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105 {selectedTheme.id === theme.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
				onclick={() => selectTheme(theme)}
			>
				<div class="h-10 flex" style="background: {theme.background}">
					{#each theme.accentColors.slice(0, 8) as color}
						<div class="flex-1" style="background: {color}"></div>
					{/each}
				</div>
				<div class="bg-white p-1 dark:bg-gray-800">
					<p class="text-[10px] font-medium truncate text-gray-700 dark:text-gray-300">{theme.name}</p>
				</div>
				{#if selectedTheme.id === theme.id}
					<div class="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	{#if currentPage < totalPages - 1 && searchQuery.length === 0}
		<div class="text-center">
			<button
				class="rounded-lg bg-gray-200 px-4 py-1.5 text-sm transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
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
