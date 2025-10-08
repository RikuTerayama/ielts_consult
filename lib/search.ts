import FlexSearch from 'flexsearch';
import { Post } from './posts';

export interface SearchIndex {
  index: FlexSearch.Index;
  posts: Post[];
}

export function createSearchIndex(posts: Post[]): SearchIndex {
  const index = new FlexSearch.Index({
    preset: 'match',
    tokenize: 'forward',
    cache: true,
  });

  posts.forEach((post, i) => {
    const searchContent = `${post.title} ${post.description} ${post.tags.join(' ')} ${post.content}`;
    index.add(i, searchContent);
  });

  return { index, posts };
}

export function searchPosts(searchIndex: SearchIndex, query: string): Post[] {
  if (!query || query.trim() === '') {
    return searchIndex.posts;
  }

  const results = searchIndex.index.search(query);
  return results.map((i) => searchIndex.posts[i as number]).filter(Boolean);
}

