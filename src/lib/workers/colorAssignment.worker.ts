// Web Worker for compute-intensive color assignment algorithm
// Optimized: uses squared distances, incremental score caching, and typed arrays

interface ColorAssignmentMessage {
	positions: Array<{ x: number; y: number }>;
	colors: string[];
}

interface ColorAssignmentResult {
	result: string[];
}

self.onmessage = (e: MessageEvent<ColorAssignmentMessage>) => {
	try {
		const { positions, colors } = e.data;
		const n = positions.length;
		const k = colors.length;

		if (k === 0) {
			self.postMessage({ result: Array(n).fill('#ffffff') });
			return;
		}

		if (k >= n) {
			// More colors than positions — just assign each a unique color
			const result: string[] = new Array(n);
			for (let i = 0; i < n; i++) {
				result[i] = colors[i];
			}
			self.postMessage({ result });
			return;
		}

		// Flatten positions into typed arrays for better cache performance
		const px = new Float64Array(n);
		const py = new Float64Array(n);
		for (let i = 0; i < n; i++) {
			px[i] = positions[i].x;
			py[i] = positions[i].y;
		}

		// assigned[i] = 1 if position i is taken, 0 otherwise
		const assigned = new Uint8Array(n);

		// result[i] = color index assigned to position i, -1 if unassigned
		const resultColorIdx = new Int16Array(n).fill(-1);

		// For each color, track which positions have been assigned (flat indices)
		const colorAssignments: number[][] = colors.map(() => []);
		let remaining = n;
		const assignmentsPerColor = Math.ceil(n / k);

		for (let round = 0; round < assignmentsPerColor && remaining > 0; round++) {
			for (let colorIdx = 0; colorIdx < k && remaining > 0; colorIdx++) {
				const assignedPositions = colorAssignments[colorIdx];
				const numAssigned = assignedPositions.length;

				if (numAssigned === 0) {
					// First assignment: pick first available position
					for (let p = 0; p < n; p++) {
						if (!assigned[p]) {
							assigned[p] = 1;
							resultColorIdx[p] = colorIdx;
							assignedPositions.push(p);
							remaining--;
							break;
						}
					}
					continue;
				}

				let bestPos = -1;
				let bestMinDistSq = -1;

				for (let p = 0; p < n; p++) {
					if (assigned[p]) continue;

					let minD = Infinity;
					for (let a = 0; a < numAssigned; a++) {
						const cp = assignedPositions[a];
						const dx = px[p] - px[cp];
						const dy = py[p] - py[cp];
						const dSq = dx * dx + dy * dy;
						if (dSq < minD) minD = dSq;
					}

					if (minD > bestMinDistSq) {
						bestMinDistSq = minD;
						bestPos = p;
					}
				}

				if (bestPos !== -1) {
					assigned[bestPos] = 1;
					resultColorIdx[bestPos] = colorIdx;
					assignedPositions.push(bestPos);
					remaining--;
				}
			}
		}

		// Build result array with color strings
		const result: string[] = new Array(n);
		for (let i = 0; i < n; i++) {
			result[i] = resultColorIdx[i] >= 0 ? colors[resultColorIdx[i]] : '#ffffff';
		}

		self.postMessage({ result } as ColorAssignmentResult);
	} catch (err) {
		self.postMessage({ error: err instanceof Error ? err.message : String(err) });
	}
};
