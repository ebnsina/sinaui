import { flip } from 'svelte/animate';
import { cubicOut } from 'svelte/easing';
import { scale } from 'svelte/transition';
import { spring } from './spring';

/** The house curves, for the Web Animations API (same as the --ui-ease-* tokens). */
export const ease = {
	enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
	standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
	exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
	inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
	spring: spring(0.03)
};

/** People who ask their system for less motion get none. */
export const reduced = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A duration, or 0 for reduced motion. */
export const ms = (n: number) => (reduced() ? 0 : n);

/** `animate:reflow`: list items glide to their new places as others come, go or move. */
export const reflow: typeof flip = (node, rects, { duration = 200, ...rest } = {}) =>
	flip(node, rects, { easing: cubicOut, ...rest, duration: ms(Number(duration)) });

/**
 * Cascades a set of elements in, one after another: each fades and travels `offset` px into place on an
 * expo-out curve, a fixed beat apart, with the whole cascade capped so a long list never drags.
 * Opacity and transform only; nothing for reduced motion. Returns the animations so callers can cancel
 * or reverse them.
 */
export function stagger(
	els: Element[],
	{
		x = 0,
		y = 8,
		delay = 0,
		each = 30,
		max = 210,
		duration = 450
	}: { x?: number; y?: number; delay?: number; each?: number; max?: number; duration?: number } = {}
): Animation[] {
	if (reduced() || !els.length) return [];
	// Fixed rhythm for short lists; long lists share the capped span so the last row isn't left waiting.
	const step = Math.min(each, max / Math.max(1, els.length - 1));
	return els.map((el, i) =>
		el.animate([{ opacity: 0, translate: `${x}px ${y}px` }, {}], {
			duration,
			delay: delay + i * step,
			easing: ease.enter,
			fill: 'backwards'
		})
	);
}

/** `in:pop` / `out:pop`: an item joining or leaving a list grows in or shrinks away. */
export const pop: typeof scale = (node, { duration = 150, ...rest } = {}) =>
	scale(node, { start: 0.95, easing: cubicOut, ...rest, duration: ms(duration) });
