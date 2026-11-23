import type { ImageGenerationResult, TranscriptionResult, TTSResult } from '@tanstack/ai';
import type {
	ImageGenerateInput,
	SpeechGenerateInput,
	TranscriptionGenerateInput,
	VideoGenerateInput,
	VideoGenerateResult
} from '@tanstack/ai-svelte';

// Stand-ins for the endpoints so the demos run without a key. Each takes as long as a real
// request might and honors Stop. Images and video are geometric star patterns drawn from the
// prompt; the voice is a short melody, since only a real model can speak.

const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((done, fail) => {
		const t = setTimeout(done, ms);
		signal?.addEventListener(
			'abort',
			() => (clearTimeout(t), fail(new DOMException('Stopped', 'AbortError')))
		);
	});

// The same prompt always gives the same colors.
function hues(text: string) {
	let h = 0;
	for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 360;
	return [h, (h + 40) % 360, (h + 180) % 360];
}

// A soft gray landscape: sky, sun and two ridges of hills. Each prompt and seed moves the sun and
// reshapes the hills, so every picture in a set differs while staying calm and monochrome.
function ridge(w: number, h: number, base: number, swing: number, waves: number, phase: number) {
	const pts: string[] = [];
	for (let x = 0; x <= w; x += w / 48)
		pts.push(
			`${x.toFixed(1)},${(h * base + h * swing * Math.sin((x / w) * Math.PI * 2 * waves + phase)).toFixed(1)}`
		);
	return `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
}

function pattern(prompt: string, w: number, h: number, seed: number) {
	const [a] = hues(prompt).map((x) => (x + seed * 67) % 360);
	const t = a / 360;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4d4d8"/><stop offset="1" stop-color="#f1f1f3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#sky)"/><circle cx="${(w * (0.2 + 0.6 * t)).toFixed(1)}" cy="${(h * 0.34).toFixed(1)}" r="${(h * 0.09).toFixed(1)}" fill="#fafafa"/><path d="${ridge(w, h, 0.62, 0.06, 1.2, t * 9)}" fill="#b8b8be"/><path d="${ridge(w, h, 0.78, 0.07, 0.8, t * 5 + 2)}" fill="#8c8c93"/></svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function demoImages(
	input: ImageGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<ImageGenerationResult> {
	await wait(1800, o?.signal);
	const [w, h] = (input.size ?? '1024x1024').split('x').map((n) => Number(n) / 2);
	const prompt = String(input.prompt);
	return {
		id: crypto.randomUUID(),
		model: 'demo',
		images: Array.from({ length: input.numberOfImages ?? 1 }, (_, i) => ({
			url: pattern(prompt, w, h, i)
		}))
	};
}

// A plucked-string melody (Karplus–Strong), longer for longer text, as a WAV.
function melody(seconds: number) {
	const rate = 22050;
	const samples = new Float32Array(Math.floor(rate * seconds));
	const notes = [293.66, 329.63, 349.23, 392, 440, 392, 349.23, 329.63];
	const step = Math.floor(rate * 0.35);
	for (let n = 0; n * step < samples.length; n++) {
		const period = Math.round(rate / notes[n % notes.length]);
		const buf = Float32Array.from({ length: period }, () => Math.random() * 2 - 1);
		for (let i = 0; i < rate * 1.2 && n * step + i < samples.length; i++) {
			const j = i % period;
			buf[j] = 0.996 * 0.5 * (buf[j] + buf[(j + 1) % period]);
			samples[n * step + i] += buf[j] * 0.3;
		}
	}
	const data = new DataView(new ArrayBuffer(44 + samples.length * 2));
	const text = (at: number, s: string) =>
		[...s].forEach((c, i) => data.setUint8(at + i, c.charCodeAt(0)));
	text(0, 'RIFF');
	data.setUint32(4, 36 + samples.length * 2, true);
	text(8, 'WAVEfmt ');
	data.setUint32(16, 16, true);
	data.setUint16(20, 1, true);
	data.setUint16(22, 1, true);
	data.setUint32(24, rate, true);
	data.setUint32(28, rate * 2, true);
	data.setUint16(32, 2, true);
	data.setUint16(34, 16, true);
	text(36, 'data');
	data.setUint32(40, samples.length * 2, true);
	samples.forEach((v, i) => data.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 0x7fff, true));
	let binary = '';
	const bytes = new Uint8Array(data.buffer);
	for (let i = 0; i < bytes.length; i += 0x8000)
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(binary);
}

export async function demoSpeech(
	input: SpeechGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<TTSResult> {
	await wait(1200, o?.signal);
	const duration = Math.min(8, Math.max(3, (input.text ?? '').length * 0.05));
	return {
		id: crypto.randomUUID(),
		model: 'demo',
		audio: melody(duration),
		format: 'wav',
		duration
	};
}

export async function demoTranscribe(
	_input: TranscriptionGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<TranscriptionResult> {
	await wait(1500, o?.signal);
	return {
		id: crypto.randomUUID(),
		model: 'demo',
		language: 'en',
		text: 'This demo returns the same line whatever you record: "The House of Wisdom kept its doors open to scholars from every land." Connected to a transcription model, your own words appear here.'
	};
}

// Records a few seconds of a turning star pattern from a canvas, as a real video file.
export async function demoVideo(
	input: VideoGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<VideoGenerateResult> {
	const canvas = Object.assign(document.createElement('canvas'), { width: 640, height: 360 });
	const g = canvas.getContext('2d')!;
	const [a, b] = hues(String(input.prompt));
	const type = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((t) =>
		MediaRecorder.isTypeSupported(t)
	);
	const recorder = new MediaRecorder(canvas.captureStream(30), type ? { mimeType: type } : {});
	const chunks: Blob[] = [];
	recorder.ondataavailable = (e) => chunks.push(e.data);
	const start = performance.now();
	let raf: number;
	const draw = (t: number) => {
		const s = (t - start) / 1000;
		// The same landscape as the pictures, with the hills drifting and the sun rising.
		const sky = g.createLinearGradient(0, 0, 0, 360);
		sky.addColorStop(0, '#d4d4d8');
		sky.addColorStop(1, '#f1f1f3');
		g.fillStyle = sky;
		g.fillRect(0, 0, 640, 360);
		g.fillStyle = '#fafafa';
		g.beginPath();
		g.arc(128 + (a / 360) * 384, 130 - s * 6, 32, 0, Math.PI * 2);
		g.fill();
		for (const [base, swing, waves, fill, speed] of [
			[0.62, 0.06, 1.2, '#b8b8be', 0.25],
			[0.78, 0.07, 0.8, '#8c8c93', 0.5]
		] as const) {
			g.fillStyle = fill;
			g.fill(new Path2D(ridge(640, 360, base, swing, waves, b / 60 + s * speed)));
		}
		raf = requestAnimationFrame(draw);
	};
	raf = requestAnimationFrame(draw);
	recorder.start();
	try {
		await wait((input.duration ?? 4) * 1000, o?.signal);
	} finally {
		cancelAnimationFrame(raf);
		const stopped = new Promise((done) => (recorder.onstop = done));
		recorder.stop();
		await stopped;
	}
	const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
	return { jobId: crypto.randomUUID(), status: 'completed', url };
}
