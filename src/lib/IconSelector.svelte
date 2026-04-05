<script lang="ts">
	import { allIcons, totalIcons, getIconSvgUrl } from '$lib/icons';
	import type { Icon } from '$lib/types';

	const INITIAL_CHUNK = 60;
	const LOAD_MORE_CHUNK = 120;

	interface Props {
		selectedIcons: Icon[];
		onToggle: (icon: Omit<Icon, 'svg'>) => void;
	}

	let { selectedIcons, onToggle }: Props = $props();

	let searchQuery = $state('');
	let visibleCount = $state(INITIAL_CHUNK);
	let sentinel: HTMLDivElement;

	const filteredIcons = $derived(
		searchQuery.length > 0
			? allIcons.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
			: allIcons
	);

	const visibleIcons = $derived(filteredIcons.slice(0, visibleCount));

	$effect(() => {
		searchQuery;
		visibleCount = INITIAL_CHUNK;
	});

	function isSelected(slug: string): boolean {
		return selectedIcons.some((i) => i.id === slug);
	}

	function handleToggle(icon: Omit<Icon, 'svg'>) {
		onToggle(icon);
	}

	$effect(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && visibleCount < filteredIcons.length) {
					visibleCount += LOAD_MORE_CHUNK;
				}
			},
			{ rootMargin: '600px' }
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class="space-y-4">
	<input
		type="text"
		aria-label="Search icons"
		placeholder="Search {totalIcons} icons..."
		bind:value={searchQuery}
		class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-violet-500/40"
	/>

	{#if selectedIcons.length > 0}
		<div class="flex flex-wrap gap-1">
			{#each selectedIcons as icon}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-violet-500/20"
				>
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

	<div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
		{#each visibleIcons as icon}
			<button
				class="group relative rounded-lg border border-white/10 bg-white/5 p-2.5 transition-all hover:border-white/20 hover:bg-white/10 {isSelected(
					icon.slug
				)
					? 'border-violet-500/50 bg-violet-500/10'
					: ''}"
				aria-pressed={isSelected(icon.slug)}
				onclick={() => handleToggle(icon)}
			>
				<div class="mb-1.5 flex aspect-square items-center justify-center">
					<img
						src={getIconSvgUrl(icon.slug)}
						alt={icon.title}
						class="h-full w-full object-contain opacity-90 grayscale invert"
						loading="lazy"
					/>
				</div>
				<p
					class="truncate text-center text-[10px] font-medium text-gray-400 group-hover:text-gray-300"
				>
					{icon.title}
				</p>
				{#if isSelected(icon.slug)}
					<div
						class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500"
						aria-hidden="true"
					>
						<svg
							class="h-2.5 w-2.5 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Sentinel for loading more -->
	<div bind:this={sentinel} class="h-1"></div>

	{#if filteredIcons.length === 0}
		<div class="py-12 text-center text-gray-500">
			<p>No icons found</p>
		</div>
	{/if}
</div>
