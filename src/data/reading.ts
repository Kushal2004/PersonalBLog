import type { CollectionEntry } from "astro:content";

/** One source of truth for the index, chapters, cards, and chapter navigation. */
export function getReadingPosts(posts: CollectionEntry<"post">[]) {
	return posts
		.filter((post) => !post.data.draft)
		.sort((a, b) => {
			const order = (a.data.reading?.order ?? Infinity) - (b.data.reading?.order ?? Infinity);
			return (
				order ||
				a.data.publishDate.valueOf() - b.data.publishDate.valueOf() ||
				a.slug.localeCompare(b.slug)
			);
		});
}

export function getReadingEntries(posts: CollectionEntry<"post">[]) {
	return getReadingPosts(posts).map((post, index) => ({
		category: post.data.reading?.section ?? post.data.tags[0] ?? "Notes",
		href: `/posts/${post.slug}/`,
		id: post.slug,
		number: String(index + 1).padStart(2, "0"),
		question: post.data.reading?.question ?? "What do you remember about this post?",
		section: post.data.reading?.section ?? "From the blog",
		summary: post.data.reading?.summary ?? post.data.description,
		tags: post.data.tags,
		term: post.data.reading?.term ?? post.data.title,
		title: post.data.title,
	}));
}

export type ReadingEntry = ReturnType<typeof getReadingEntries>[number];
