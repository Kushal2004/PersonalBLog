interface MotionOptions {
	animate?: boolean;
	target?: () => HTMLElement;
}

/** Animate a DOM update without delaying controls or queuing stale selections. */
export function contentMotion(container: HTMLElement) {
	let animations: Animation[] = [];
	let revision = 0;
	const cancel = () => {
		revision++;
		animations.forEach((animation) => animation.cancel());
		animations = [];
		container.style.removeProperty("overflow");
	};
	const update = (change: () => void, options: MotionOptions = {}) => {
		const previousHeight = container.getBoundingClientRect().height;
		cancel();
		change();
		if (
			options.animate === false ||
			matchMedia("(prefers-reduced-motion: reduce)").matches ||
			typeof container.animate !== "function"
		)
			return;
		const currentRevision = revision;
		const nextHeight = container.getBoundingClientRect().height;
		const target = options.target?.() ?? container;
		container.style.overflow = "clip";
		const easing = "cubic-bezier(.22, 1, .36, 1)";
		if (Math.abs(nextHeight - previousHeight) > 1) {
			animations.push(
				container.animate([{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }], {
					duration: 300,
					easing,
				}),
			);
		}
		animations.push(
			target.animate(
				[
					{ opacity: 0, transform: "translate3d(0, 12px, 0)" },
					{ opacity: 1, transform: "translate3d(0, 0, 0)" },
				],
				{ duration: 300, easing },
			),
		);
		void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
			if (revision !== currentRevision) return;
			container.style.removeProperty("overflow");
			animations = [];
		});
	};
	return { cancel, update };
}
