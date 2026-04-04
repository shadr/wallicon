// Fetch all base24 themes from tinted-theming/schemes and generate themes.ts
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BRANCH = 'spec-0.11';
const BASE_URL = `https://raw.githubusercontent.com/tinted-theming/schemes/${BRANCH}/base24`;

async function fetchTheme(slug) {
	try {
		const res = await fetch(`${BASE_URL}/${slug}.yaml`);
		if (!res.ok) return null;
		const text = await res.text();
		const result = parseYaml(text);
		if (!result.name || !result.base00) return null;
		return result;
	} catch {
		return null;
	}
}

function parseYaml(text) {
	const result = {};
	let inPalette = false;
	for (const line of text.split('\n')) {
		const m = line.match(/^(\s*)(\w[\w-]*):\s*(?:"([^"]*?)"|([^#\s]+))?\s*(?:#.*)?$/);
		if (!m) continue;
		const indent = m[1].length;
		const key = m[2].trim();
		const val = (m[3] !== undefined ? m[3] : m[4] || '').trim();

		if (key === 'name') result.name = val;
		if (key === 'variant') result.variant = val;
		if (key === 'palette') { inPalette = true; continue; }
		if (indent > 0 && inPalette) {
			if (key === 'base00') result.base00 = val;
			if (key === 'base01') result.base01 = val;
			if (key === 'base02') result.base02 = val;
			if (key === 'base11') result.base11 = val;
			if (key === 'base08') result.base08 = val;
			if (key === 'base09') result.base09 = val;
			if (key === 'base0A') result.base0A = val;
			if (key === 'base0B') result.base0B = val;
			if (key === 'base0C') result.base0C = val;
			if (key === 'base0D') result.base0D = val;
			if (key === 'base0E') result.base0E = val;
			if (key === 'base0F') result.base0F = val;
			if (key === 'base12') result.base12 = val;
			if (key === 'base13') result.base13 = val;
			if (key === 'base14') result.base14 = val;
			if (key === 'base15') result.base15 = val;
			if (key === 'base16') result.base16 = val;
			if (key === 'base17') result.base17 = val;
		}
	}
	return result;
}

async function main() {
	const slugs = [
		'3024-day', '3024-night', 'adventure-time', 'alien-blood', 'argonaut',
		'arthur', 'atelier-sulphurpool', 'ayu-dark', 'ayu-light', 'ayu-mirage',
		'banana-blueberry', 'batman', 'birds-of-paradise', 'blazer', 'blue-berry-pie',
		'blue-matrix', 'bluloco-dark', 'bluloco-light', 'borland', 'breeze',
		'broadcast', 'brogrammer', 'builtin-dark', 'builtin-light', 'builtin-pastel-dark',
		'builtin-solarized-dark', 'builtin-solarized-light', 'catppuccin-frappe',
		'catppuccin-latte', 'catppuccin-macchiato', 'catppuccin-mocha', 'chalk',
		'chalkboard', 'challenger-deep', 'ciapre', 'clrs', 'cobalt-neon', 'cobalt2',
		'crayon-pony-fish', 'cyberdyne', 'dark-plus', 'deep-oceanic-next', 'deep',
		'desert', 'dimmed-monokai', 'dracula', 'earthsong', 'eldritch', 'elemental',
		'elementary', 'embarcadero', 'encom', 'espresso-libre', 'espresso',
		'fideloper', 'firefox-dev', 'fish-tank', 'flat', 'flatland',
		'flexoki-dark', 'flexoki-light', 'floraverse', 'forest-blue', 'framer',
		'front-end-delight', 'fun-forrest', 'galaxy', 'github-dark', 'github',
		'grape', 'gruvbox-dark', 'gruvbox-light', 'hacktober', 'hardcore',
		'highway', 'hipster-green', 'hivacruz', 'homebrew', 'hopscotch',
		'hurtado', 'hybrid', 'ic-green-ppl', 'ic-orange-ppl', 'idea',
		'idle-toes', 'jackie-brown', 'japanesque', 'jellybeans', 'jet-brains-darcula',
		'kanagawa-dragon', 'kibble', 'lab-fox', 'laser', 'later-this-evening',
		'lavandula', 'lovelace', 'man-page', 'material-dark', 'material',
		'mathias', 'medallion', 'mission-brogue', 'misterioso', 'molokai',
		'mona-lisa', 'monokai-vivid', 'mountain', 'night-lion-v1', 'night-lion-v2',
		'night-owlish-light', 'nocturnal-winter', 'obsidian', 'ocean', 'oceanic-next',
		'one-dark', 'one-light', 'outrun-dark', 'pandora', 'papercolor-dark',
		'papercolor-light', 'paraiso', 'pasque', 'paul-millr', 'pinky',
		'pop', 'porple', 'precious-dark-fifteen', 'precious-dark-warm',
		'precious-light-warm', 'precious-light-white', 'primer', 'prism',
		'purpledream', 'qualia', 'railscasts', 'rebecca', 'rose-pine-dawn',
		'rose-pine-moon', 'rose-pine', 'saga', 'sagelight', 'sakura',
		'sandcastle', 'seti-ui', 'shapeshifter', 'silk-dark', 'silk-light',
		'snazzy', 'snazzy-light', 'solarflare', 'solarized-dark', 'solarized-light',
		'spaceduck', 'spacegray-eighties', 'sparky', 'starry-night', 'summercamp',
		'summerfruit-dark', 'summerfruit-light', 'synthwave', 'synthwave-everything',
		'ta-one-dark', 'ta-one-light', 'tango', 'tender', 'terracotta',
		'tokyo-night-dark', 'tokyo-night-light', 'tokyo-night-moon', 'tokyo-night-storm',
		'tomorrow', 'tomorrow-night', 'tomorrow-night-bright', 'tomorrow-night-eighties',
		'tube', 'twilight', 'unikitty-dark', 'unikitty-light', 'unique',
		'unikitty-reversible', 'uwunicorn', 'vesper', 'vulcan', 'windows-10',
		'windows-10-light', 'windows-95', 'windows-95-light', 'windows-highcontrast',
		'windows-nt', 'wombat', 'woodland', 'xcode-dusk', 'zenburn'
	];

	console.log(`Fetching ${slugs.length} themes...`);

	const themes = [];
	let ok = 0, fail = 0;
	for (const slug of slugs) {
		const data = await fetchTheme(slug);
		if (data) {
			themes.push({ slug, ...data });
			ok++;
		} else {
			fail++;
		}
	}

	console.log(`Fetched ${ok} OK, ${fail} failed`);

	// Generate TypeScript output
	const accentKeys = ['base08','base09','base0A','base0B','base0C','base0D','base0E','base0F','base12','base13','base14','base15','base16','base17'];
	const tsLines = [
		'// Auto-generated from tinted-theming/schemes base24',
		'// https://github.com/tinted-theming/schemes',
		'',
		'import type { Theme } from \'./types\';',
		'',
		'export const themes: Theme[] = ['
	];
	for (const t of themes) {
		const accentColors = accentKeys.map(k => t[k]).filter(Boolean);
		tsLines.push('\t{');
		tsLines.push(`\t\tid: '${t.slug}',`);
		tsLines.push(`\t\tname: '${t.name.replace(/'/g, "\\'")}',`);
		tsLines.push(`\t\tbackground: '${t.base00}',`);
		tsLines.push(`\t\taccentColors: [${accentColors.map(c => `'${c}'`).join(', ')}]`);
		tsLines.push('\t},');
	}
	tsLines.push('];');
	tsLines.push('');

	const ts = tsLines.join('\n');
	const outPath = join(__dirname, '../src/lib/themes.ts');
	writeFileSync(outPath, ts);
	console.log(`Generated ${themes.length} themes to ${outPath}`);
}

main().catch(console.error);
