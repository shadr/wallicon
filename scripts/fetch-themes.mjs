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

async function fetchAllSlugs() {
	const res = await fetch(
		`https://api.github.com/repos/tinted-theming/schemes/contents/base24?ref=${BRANCH}`
	);
	if (!res.ok) throw new Error(`Failed to fetch directory: ${res.status}`);
	const items = await res.json();
	return items
		.filter((item) => item.name.endsWith('.yaml'))
		.map((item) => item.name.replace('.yaml', ''))
		.sort();
}

async function main() {
	const slugs = await fetchAllSlugs();
	console.log(`Found ${slugs.length} themes in repo`);

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
		// Small delay to avoid rate limiting
		if ((ok + fail) % 50 === 0) await new Promise((r) => setTimeout(r, 1000));
	}

	console.log(`Fetched ${ok} OK, ${fail} failed`);

	// Generate TypeScript output
	const accentKeys = ['base08','base09','base0A','base0B','base0C','base0D','base0E','base0F'];
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
