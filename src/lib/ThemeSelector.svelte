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
	let visibleCount = $state(THEMES_PER_PAGE);
	let sentinel: HTMLDivElement;

	const filteredThemes = $derived(
		searchQuery.length > 0
			? themes.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: themes
	);

	const visibleThemes = $derived(filteredThemes.slice(0, visibleCount));

	$effect(() => {
		visibleCount = THEMES_PER_PAGE;
	});

	function selectTheme(theme: Theme) {
		onSelect(theme);
	}

	// IntersectionObserver for infinite scroll
	$effect(() => {
		if (!sentinel || searchQuery.length > 0) return;
		if (visibleCount >= filteredThemes.length) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visibleCount += THEMES_PER_PAGE;
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class="space-y-4">
	<input
		type="text"
		placeholder="Search {themes.length} themes..."
		bind:value={searchQuery}
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

	<!-- Sentinel for infinite scroll -->
	<div bind:this={sentinel} class="h-1"></div>

	{#if filteredThemes.length === 0}
		<div class="py-8 text-center text-gray-500">
			<p>No themes found</p>
		</div>
	{/if}
</div>
