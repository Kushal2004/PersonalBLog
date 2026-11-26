const reading = document.querySelector<HTMLElement>("[data-reading]");

if (reading) {
	const modes = ["index", "book", "flashcards"];
	const preferenceKey = "personal-blog-reading-view-v1";
	const buttons = [...reading.querySelectorAll<HTMLButtonElement>("[data-reading-mode]")];
	const panels = [...reading.querySelectorAll<HTMLElement>("[data-reading-panel]")];
	const status = reading.querySelector<HTMLElement>("[data-reading-status]")!;
	const stored = () => {
		try {
			return localStorage.getItem(preferenceKey) ?? "index";
		} catch {
			return "index";
		}
	};
	const applyMode = (value: string, remember = false) => {
		const mode = modes.includes(value) ? value : "index";
		panels.forEach((panel) => {
			panel.hidden = panel.dataset.readingPanel !== mode;
		});
		buttons.forEach((button) =>
			button.setAttribute("aria-pressed", String(button.dataset.readingMode === mode)),
		);
		status.textContent = `Showing ${mode === "book" ? "book chapters" : mode === "flashcards" ? "flashcards" : "the field index"}.`;
		if (remember) {
			try {
				localStorage.setItem(preferenceKey, mode);
			} catch {
				/* Storage is optional. */
			}
			history.replaceState(null, "", `${location.pathname}${location.search}#${mode}`);
		}
	};
	reading.querySelector<HTMLElement>("[data-reading-controls]")!.hidden = false;
	reading.dataset.enhanced = "true";
	applyMode(modes.includes(location.hash.slice(1)) ? location.hash.slice(1) : stored());
	buttons.forEach((button) =>
		button.addEventListener("click", () => applyMode(button.dataset.readingMode!, true)),
	);
	window.addEventListener("hashchange", () => {
		if (modes.includes(location.hash.slice(1))) applyMode(location.hash.slice(1));
	});

	const grid = reading.querySelector<HTMLElement>("[data-index-grid]")!;
	const notes = [...grid.querySelectorAll<HTMLAnchorElement>("[data-index-entry]")];
	const search = reading.querySelector<HTMLInputElement>("[data-index-search]")!;
	const topic = reading.querySelector<HTMLSelectElement>("[data-index-topic]")!;
	const sort = reading.querySelector<HTMLSelectElement>("[data-index-sort]")!;
	const count = reading.querySelector<HTMLElement>("[data-index-count]")!;
	const collator = new Intl.Collator(document.documentElement.lang, {
		sensitivity: "base",
		numeric: true,
	});
	const updateIndex = () => {
		const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
		let visible = 0;
		const ordered =
			sort.value === "az"
				? [...notes].sort((a, b) => collator.compare(a.dataset.term!, b.dataset.term!))
				: notes;
		ordered.forEach((note) => {
			const tags = JSON.parse(note.dataset.tags!) as string[];
			const text = `${note.textContent} ${tags.join(" ")}`.toLocaleLowerCase();
			note.hidden =
				!words.every((word) => text.includes(word)) ||
				(!!topic.value && !tags.includes(topic.value));
			if (!note.hidden) visible++;
			grid.append(note);
		});
		count.textContent = `${visible} of ${notes.length} notes`;
		reading.querySelector<HTMLElement>("[data-index-empty]")!.hidden =
			visible !== 0 || notes.length === 0;
	};
	reading.querySelector<HTMLElement>("[data-index-controls]")!.hidden = false;
	count.hidden = false;
	search.addEventListener("input", updateIndex);
	topic.addEventListener("change", updateIndex);
	sort.addEventListener("change", updateIndex);
	updateIndex();

	setupDeck(reading);
}

type Pile = "need" | "know" | "saved";
type Review = Pile | "all";
type Action = Pile | "reveal";

function setupDeck(root: HTMLElement) {
	const deck = root.querySelector<HTMLElement>("[data-flashcards]")!;
	const cards = [...deck.querySelectorAll<HTMLElement>("[data-card]")];
	if (!cards.length) return;
	const key = "personal-blog-flashcards-v1";
	const validPiles = new Set(["need", "know", "saved"]);
	const statuses = new Map<string, Pile>();
	try {
		const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "{}");
		if (saved && typeof saved === "object" && !Array.isArray(saved)) {
			cards.forEach((card) => {
				const value: unknown = (saved as Record<string, unknown>)[card.dataset.cardId!];
				if (typeof value === "string" && validPiles.has(value))
					statuses.set(card.dataset.cardId!, value as Pile);
			});
		}
	} catch {
		/* A new deck works even if saved data is unavailable. */
	}
	const actions = [...deck.querySelectorAll<HTMLButtonElement>("[data-card-action]")];
	const reviewButtons = [...deck.querySelectorAll<HTMLButtonElement>("[data-review]")];
	const order = deck.querySelector<HTMLSelectElement>("[data-deck-order]")!;
	const progress = deck.querySelector<HTMLProgressElement>("[data-deck-progress]")!;
	const position = deck.querySelector<HTMLElement>("[data-deck-position]")!;
	const announcement = deck.querySelector<HTMLElement>("[data-deck-announcement]")!;
	const finish = deck.querySelector<HTMLElement>("[data-deck-finish]")!;
	const undo = deck.querySelector<HTMLButtonElement>("[data-deck-undo]")!;
	const revealLabel = deck.querySelector<HTMLElement>("[data-reveal-label]")!;
	const history: { id: string; previous: Pile | undefined }[] = [];
	let queue: HTMLElement[] = [];
	let cursor = 0;
	let review: Review = "all";
	let resuming = false;
	const labels = {
		all: "All cards",
		need: "Need to learn",
		know: "Known",
		saved: "Saved for later",
	};
	const current = () => queue[cursor];
	const save = () => {
		try {
			localStorage.setItem(key, JSON.stringify(Object.fromEntries(statuses)));
		} catch {
			/* Storage is optional. */
		}
	};
	const render = (focus = false) => {
		cards.forEach((card) => {
			card.hidden = card !== current();
			card.style.removeProperty("transform");
			card.querySelector<HTMLDetailsElement>("[data-card-answer]")!.open = false;
		});
		const complete = !current();
		finish.hidden = !complete;
		position.textContent = complete
			? `${queue.length} of ${queue.length} cards sorted`
			: `Card ${cursor + 1} of ${queue.length}`;
		progress.max = Math.max(queue.length, 1);
		progress.value = complete ? progress.max : cursor;
		actions.forEach((button) => {
			button.disabled = complete;
		});
		revealLabel.textContent = "Learn more";
		undo.disabled = history.length === 0;
		deck.querySelector<HTMLElement>("[data-deck-round]")!.textContent = resuming
			? "Remaining cards"
			: labels[review];
		reviewButtons.forEach((button) => {
			const pile = button.dataset.review as Review;
			const total = [...statuses.values()].filter((value) => value === pile).length;
			button.disabled = pile !== "all" && total === 0;
			button.setAttribute("aria-pressed", String(pile === review));
			const count = button.querySelector<HTMLElement>("[data-count]");
			if (count) count.textContent = `(${total})`;
		});
		if (focus)
			(current() ?? deck.querySelector<HTMLElement>("[data-deck-finish-title]"))?.focus({
				preventScroll: true,
			});
	};
	const startRound = (pile: Review, resume = false) => {
		review = pile;
		resuming = resume;
		queue = cards.filter((card) =>
			pile === "all"
				? !resume || !statuses.has(card.dataset.cardId!)
				: statuses.get(card.dataset.cardId!) === pile,
		);
		if (order.value === "az")
			queue.sort((a, b) => a.dataset.cardTitle!.localeCompare(b.dataset.cardTitle!));
		if (order.value === "shuffle") {
			for (let i = queue.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[queue[i], queue[j]] = [queue[j]!, queue[i]!];
			}
		}
		cursor = 0;
		history.length = 0;
		render();
		announcement.textContent = `Reviewing ${labels[pile].toLowerCase()}. ${queue.length} cards.`;
	};
	const act = (action: Action, focus = false) => {
		const card = current();
		if (!card) return;
		if (action === "reveal") {
			const answer = card.querySelector<HTMLDetailsElement>("[data-card-answer]")!;
			answer.open = !answer.open;
			return;
		}
		const id = card.dataset.cardId!;
		history.push({ id, previous: statuses.get(id) });
		statuses.set(id, action);
		cursor++;
		save();
		render(focus || !current());
		announcement.textContent = `${card.dataset.cardTitle} placed in ${labels[action]}.${current() ? ` Next: ${current()!.dataset.cardTitle}.` : " Round complete."}`;
	};
	deck.querySelectorAll<HTMLElement>("[data-deck-controls]").forEach((control) => {
		control.hidden = false;
	});
	actions.forEach((button) =>
		button.addEventListener("click", () => act(button.dataset.cardAction as Action)),
	);
	reviewButtons.forEach((button) =>
		button.addEventListener("click", () => startRound(button.dataset.review as Review)),
	);
	order.addEventListener("change", () => startRound(review));
	deck.querySelector<HTMLButtonElement>("[data-deck-reset]")!.addEventListener("click", () => {
		statuses.clear();
		save();
		startRound("all");
		announcement.textContent = "Progress reset. All cards are ready to study again.";
	});
	undo.addEventListener("click", () => {
		const last = history.pop();
		if (!last) return;
		if (last.previous) statuses.set(last.id, last.previous);
		else statuses.delete(last.id);
		cursor = Math.max(0, cursor - 1);
		save();
		render();
		announcement.textContent = "Last card restored.";
	});
	cards.forEach((card) => {
		const answer = card.querySelector<HTMLDetailsElement>("[data-card-answer]")!;
		answer.addEventListener("toggle", () => {
			if (card === current()) revealLabel.textContent = answer.open ? "Hide note" : "Learn more";
		});
		card.addEventListener("keydown", (event) => {
			if (event.target !== card) return;
			const action = (
				{
					ArrowLeft: "need",
					ArrowRight: "know",
					ArrowUp: "reveal",
					ArrowDown: "saved",
					" ": "reveal",
					Enter: "reveal",
				} as Record<string, Action>
			)[event.key];
			if (action) {
				event.preventDefault();
				act(action, true);
			}
		});
		let pointer: { id: number; x: number; y: number; swipe: boolean } | undefined;
		card.addEventListener("pointerdown", (event) => {
			if (
				!event.isPrimary ||
				event.button !== 0 ||
				(event.target as HTMLElement).closest("a, summary")
			)
				return;
			pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, swipe: false };
			card.setPointerCapture(event.pointerId);
		});
		card.addEventListener("pointermove", (event) => {
			if (!pointer || pointer.id !== event.pointerId) return;
			const x = event.clientX - pointer.x;
			const y = event.clientY - pointer.y;
			if (Math.abs(x) > 12 && Math.abs(x) > Math.abs(y)) {
				pointer.swipe = true;
				card.setPointerCapture(event.pointerId);
				card.style.transform = `translateX(${Math.max(-70, Math.min(70, x))}px) rotate(${x / 35}deg)`;
			}
		});
		card.addEventListener("pointerup", (event) => {
			if (!pointer || pointer.id !== event.pointerId) return;
			const x = event.clientX - pointer.x;
			const y = event.clientY - pointer.y;
			card.style.removeProperty("transform");
			if (pointer.swipe && Math.abs(x) > 60 && Math.abs(x) > Math.abs(y))
				act(x > 0 ? "know" : "need");
			else if (Math.abs(y) > 60 && Math.abs(y) > Math.abs(x)) act(y > 0 ? "saved" : "reveal");
			pointer = undefined;
		});
		card.addEventListener("pointercancel", () => {
			pointer = undefined;
			card.style.removeProperty("transform");
		});
	});
	startRound("all", statuses.size > 0 && statuses.size < cards.length);
	if (statuses.size === cards.length) {
		cursor = queue.length;
		render();
	}
}

export {};
