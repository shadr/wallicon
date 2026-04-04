<script lang="ts">
	import { onMount } from 'svelte';
	import IconSelector from '$lib/IconSelector.svelte';
	import ThemeSelector from '$lib/ThemeSelector.svelte';
	import WallpaperConfig from '$lib/WallpaperConfig.svelte';
	import WallpaperGenerator from '$lib/WallpaperGenerator.svelte';
	import type { Icon, Theme, WallpaperConfig as WallpaperConfigType } from '$lib/types';
	import { themes } from '$lib/themes';
	import { encodeState, decodeState } from '$lib/state';
	import { getIconBySlug } from '$lib/icons';

	let selectedIcons = $state<Icon[]>([]);
	let selectedTheme = $state<Theme>(themes[0]);
	let config = $state<WallpaperConfigType>({
		layout: 'grid',
		iconSize: 120,
		spacing: 20,
		opacity: 0.9
	});

	let activeSection = $state<'icons' | 'theme' | 'config'>('icons');
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Load state from URL on mount
	onMount(() => {
		const query = window.location.search.slice(1);
		const saved = decodeState(query);

		if (saved.theme) {
			const found = themes.find((t) => t.id === saved.theme);
			if (found) selectedTheme = found;
		}

		if (saved.config) {
			config = saved.config;
		}

		if (saved.icons) {
			const loaded: Icon[] = [];
			for (const slug of saved.icons) {
				const icon = getIconBySlug(slug);
				if (icon) loaded.push({ ...icon, svg: '' });
			}
			selectedIcons = loaded;
		}
	});

	// Save state to URL on changes (debounced)
	function pushState() {
		const state = {
			icons: selectedIcons.map((i) => i.slug),
			theme: selectedTheme.id,
			config
		};
		const url = encodeState(state);
		window.history.replaceState({}, '', url);
	}

	function scheduleUrlUpdate() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(pushState, 300);
	}

	function toggleIcon(icon: Icon) {
		const index = selectedIcons.findIndex((i) => i.id === icon.id);
		if (index === -1) {
			selectedIcons = [...selectedIcons, icon];
		} else {
			selectedIcons = selectedIcons.filter((i) => i.id !== icon.id);
		}
		scheduleUrlUpdate();
	}

	function selectTheme(theme: Theme) {
		selectedTheme = theme;
		scheduleUrlUpdate();
	}

	function updateConfig(newConfig: WallpaperConfigType) {
		config = { ...newConfig };
		scheduleUrlUpdate();
	}
</script>

<svelte:head>
	<title>Wallicon - Icon Wallpaper Generator</title>
	<meta name="description" content="Generate beautiful wallpapers from your favorite software icons" />
</svelte:head>

<div class="flex h-screen flex-col bg-[#0e1117] text-gray-100">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-white/5 bg-[#0e1117]/80 backdrop-blur-xl">
		<div class="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
			<div class="flex items-center gap-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold">
					W
				</div>
				<h1 class="text-lg font-semibold tracking-tight">Wallicon</h1>
				<span class="hidden text-sm text-gray-500 sm:block">/</span>
				<span class="hidden text-sm text-gray-400 sm:block">Icon Wallpaper Generator</span>
			</div>
			{#if selectedIcons.length > 0}
				<div class="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400 ring-1 ring-violet-500/20">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					{selectedIcons.length} selected
				</div>
			{/if}
		</div>
	</header>

	<!-- Mobile Tab Switcher -->
	<div class="sticky top-14 z-40 border-b border-white/5 bg-[#0e1117]/90 backdrop-blur-lg lg:hidden">
		<div class="flex gap-1 p-2">
			{#each ['icons' as const, 'theme' as const, 'config' as const] as section}
				<button
					class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors {activeSection === section ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-300'}"
					onclick={() => activeSection = section}
				>
					{section === 'icons' ? 'Icons' : section === 'theme' ? 'Theme' : 'Settings'}
				</button>
			{/each}
		</div>
	</div>

	<!-- Main Content -->
	<main class="mx-auto flex w-full max-w-[1600px] flex-1 overflow-hidden">
		<!-- Left: Icons Panel -->
		<div class="w-full min-w-0 flex-1 border-r border-white/5 {activeSection !== 'icons' ? 'hidden lg:flex' : 'flex'}">
			<div class="flex min-h-0 w-full flex-col">
				<div class="flex items-center gap-2 border-b border-white/5 px-4 py-3">
					<svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
					</svg>
					<h2 class="text-sm font-medium">Icons</h2>
				</div>
				<div class="min-h-0 flex-1 overflow-y-auto p-4">
					<IconSelector {selectedIcons} onToggle={toggleIcon} />
				</div>
			</div>
		</div>

		<!-- Center: Theme + Config Panel -->
		<div class="hidden lg:flex w-96 min-w-0 flex-shrink-0 flex-col border-r border-white/5">
			<!-- Theme -->
			<div class="{activeSection === 'config' ? 'hidden' : ''}">
				<div class="flex items-center gap-2 border-b border-white/5 px-4 py-3">
					<svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
					</svg>
					<h2 class="text-sm font-medium">Theme</h2>
				</div>
				<div class="max-h-[40vh] overflow-y-auto p-4">
					<ThemeSelector {selectedTheme} onSelect={selectTheme} />
				</div>
			</div>

			<!-- Config -->
			<div class="{activeSection === 'theme' ? 'hidden' : ''}">
				<div class="flex items-center gap-2 border-b border-white/5 px-4 py-3">
					<svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
					</svg>
					<h2 class="text-sm font-medium">Layout</h2>
				</div>
				<div class="overflow-y-auto p-4">
					<WallpaperConfig config={config} onChange={updateConfig} />
				</div>
			</div>
		</div>

		<!-- Right: Preview Panel -->
		<div class="w-full min-w-0 flex-1 {activeSection !== 'icons' ? 'hidden lg:flex' : 'flex'} lg:max-w-[55%]">
			<div class="flex min-h-0 w-full flex-col">
				<div class="flex items-center gap-2 border-b border-white/5 px-4 py-3">
					<svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<h2 class="text-sm font-medium">Preview</h2>
				</div>
				<div class="flex-1 overflow-y-auto p-4">
					<WallpaperGenerator {selectedIcons} theme={selectedTheme} {config} />
				</div>
			</div>
		</div>
	</main>
</div>
