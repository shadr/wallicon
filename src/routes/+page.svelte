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

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
	<header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
						Wallicon
					</h1>
					<p class="mt-1 text-gray-600 dark:text-gray-400">Generate beautiful wallpapers from software icons</p>
				</div>
				{#if selectedIcons.length > 0}
					<div class="rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/30">
						<span class="font-medium text-blue-600">{selectedIcons.length} selected</span>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Left Panel: Configuration -->
			<div class="space-y-6">
				<!-- Mobile Tab Switcher -->
				<div class="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 lg:hidden">
					{#each ['icons' as const, 'theme' as const, 'config' as const] as section}
						<button
							class="flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors {activeSection === section ? 'bg-white shadow dark:bg-gray-700' : ''}"
							onclick={() => activeSection = section}
						>
							{section === 'config' ? 'Settings' : section}
						</button>
					{/each}
				</div>

				<!-- Icons Section -->
				<div class="{activeSection !== 'icons' ? 'hidden lg:block' : ''}">
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
						<h2 class="mb-4 text-xl font-semibold">Select Icons</h2>
						<IconSelector {selectedIcons} onToggle={toggleIcon} />
					</div>
				</div>

				<!-- Theme Section -->
				<div class="{activeSection !== 'theme' ? 'hidden lg:block' : ''}">
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
						<h2 class="mb-4 text-xl font-semibold">Color Theme</h2>
						<ThemeSelector {selectedTheme} onSelect={selectTheme} />
					</div>
				</div>

				<!-- Config Section -->
				<div class="{activeSection !== 'config' ? 'hidden lg:block' : ''}">
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
						<h2 class="mb-4 text-xl font-semibold">Layout & Style</h2>
						<WallpaperConfig config={config} onChange={updateConfig} />
					</div>
				</div>
			</div>

			<!-- Right Panel: Preview -->
			<div class="self-start lg:sticky lg:top-8">
				<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
					<WallpaperGenerator {selectedIcons} theme={selectedTheme} {config} />
				</div>
			</div>
		</div>
	</main>

	<footer class="mt-16 border-t border-gray-200 py-8 dark:border-gray-700">
		<div class="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
			<p>Wallicon — Create beautiful wallpapers with your favorite icons</p>
		</div>
	</footer>
</div>
