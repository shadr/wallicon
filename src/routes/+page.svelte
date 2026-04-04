<script lang="ts">
	import IconSelector from '$lib/IconSelector.svelte';
	import ThemeSelector from '$lib/ThemeSelector.svelte';
	import WallpaperGenerator from '$lib/WallpaperGenerator.svelte';
	import type { Icon } from '$lib/types';
	import type { Theme } from '$lib/types';
	import { themes } from '$lib/themes';

	let selectedIcons = $state<Icon[]>([]);
	let selectedTheme = $state<Theme>(themes[0]);
	let activeTab = $state<'icons' | 'theme'>('icons');

	function toggleIcon(icon: Icon) {
		const index = selectedIcons.findIndex(i => i.id === icon.id);
		if (index === -1) {
			selectedIcons = [...selectedIcons, icon];
		} else {
			selectedIcons = selectedIcons.filter(i => i.id !== icon.id);
		}
	}

	function selectTheme(theme: Theme) {
		selectedTheme = theme;
	}
</script>

<svelte:head>
	<title>Wallicon - Icon Wallpaper Generator</title>
	<meta name="description" content="Generate beautiful wallpapers from your favorite software icons" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
	<header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Wallicon
					</h1>
					<p class="text-gray-600 dark:text-gray-400 mt-1">Generate beautiful wallpapers from software icons</p>
				</div>
				{#if selectedIcons.length > 0}
					<div class="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
						<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="font-medium text-blue-600">{selectedIcons.length} selected</span>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Left Panel: Configuration -->
			<div class="space-y-6">
				<!-- Mobile Tab Switcher -->
				<div class="lg:hidden flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<button
						class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors {activeTab === 'icons' ? 'bg-white dark:bg-gray-700 shadow' : ''}"
						onclick={() => activeTab = 'icons'}
					>
						Icons
					</button>
					<button
						class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors {activeTab === 'theme' ? 'bg-white dark:bg-gray-700 shadow' : ''}"
						onclick={() => activeTab = 'theme'}
					>
						Theme
					</button>
				</div>

				<!-- Icons Section -->
				<div class="{activeTab !== 'icons' ? 'hidden lg:block' : ''}">
					<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
						<h2 class="text-xl font-semibold mb-4">Select Icons</h2>
						<IconSelector
							{selectedIcons}
							onToggle={toggleIcon}
						/>
					</div>
				</div>

				<!-- Theme Section -->
				<div class="{activeTab !== 'theme' ? 'hidden lg:block' : ''}">
					<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
						<ThemeSelector
							{selectedTheme}
							onSelect={selectTheme}
						/>
					</div>
				</div>
			</div>

			<!-- Right Panel: Preview -->
			<div class="lg:sticky lg:top-8 self-start">
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<WallpaperGenerator
						{selectedIcons}
						theme={selectedTheme}
					/>
				</div>
			</div>
		</div>
	</main>

	<footer class="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
			<p>Wallicon - Create beautiful wallpapers with your favorite icons</p>
		</div>
	</footer>
</div>
