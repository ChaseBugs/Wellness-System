'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface ContentTopic {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  article_count?: number;
  story_count?: number;
  activity_count?: number;
  recipe_count?: number;
}

interface TopicContent {
  articles?: { id: number; title: string; category?: string }[];
  stories?: { id: number; title: string; category?: string }[];
  activities?: { id: number; title: string; category?: string }[];
  recipes?: { id: number; title: string; recipe_type?: string }[];
}

export default function ContentTopicsPage() {
  const [selected, setSelected] = useState<ContentTopic | null>(null);
  const [contentType, setContentType] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: topicsRaw, loading } = useFetch<ContentTopic[]>('/content/topics');
  const topics = topicsRaw ?? [];

  const { data: topicContent, loading: loadingContent } = useFetch<TopicContent>(
    selected ? `/content/topic/${selected.id}${contentType ? `?type=${contentType}` : ''}` : null
  );

  const { data: searchResults, loading: searching } = useFetch<{ articles?: unknown[]; stories?: unknown[]; activities?: unknown[] }>(
    search.length >= 2 ? `/content/search?q=${encodeURIComponent(search)}` : null
  );

  const TYPE_COLORS: Record<string, string> = {
    article: 'bg-blue-50 text-blue-700',
    story: 'bg-purple-50 text-purple-700',
    activity: 'bg-green-50 text-green-700',
    recipe: 'bg-orange-50 text-orange-700',
  };

  const totalContent = (t: ContentTopic) =>
    (t.article_count ?? 0) + (t.story_count ?? 0) + (t.activity_count ?? 0) + (t.recipe_count ?? 0);

  const allTopicContent = [
    ...(topicContent?.articles ?? []),
    ...(topicContent?.stories ?? []),
    ...(topicContent?.activities ?? []),
    ...(topicContent?.recipes ?? []),
  ];

  const { paged: pagedTopics, page: topicsPage, totalPages: topicsTotalPages, setPage: setTopicsPage } = usePagination(topics);
  const { paged: pagedContent, page: contentPage, totalPages: contentTotalPages, setPage: setContentPage } = usePagination(allTopicContent);

  return (
    <div className="p-8">
      <PageHeader
        title="Content Topics"
        subtitle={`${topics.length} topics — Browse by Topic`}
      />

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Search Content</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search across articles, stories, activities, recipes…"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        {search.length >= 2 && (
          <div className="mt-4">
            {searching ? (
              <div className="text-sm text-slate-400">Searching…</div>
            ) : searchResults ? (
              <div className="space-y-3">
                {(['articles', 'stories', 'activities'] as const).map((type) => {
                  const items = (searchResults[type] as { id: number; title: string }[] | undefined) ?? [];
                  if (!items.length) return null;
                  return (
                    <div key={type}>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">{type} ({items.length})</div>
                      <div className="flex flex-wrap gap-2">
                        {items.slice(0, 5).map((item) => (
                          <span key={item.id} className={`px-2 py-1 rounded-lg text-xs ${TYPE_COLORS[type.slice(0, -1)] ?? 'bg-slate-50 text-slate-600'}`}>
                            {item.title}
                          </span>
                        ))}
                        {items.length > 5 && <span className="text-xs text-slate-400">+{items.length - 5} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-400">No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Topics list */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="font-semibold text-slate-800 text-sm">Topics</div>
              <div className="text-xs text-slate-400">{topics.length} total</div>
            </div>
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">Loading…</div>
            ) : topics.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No topics found</div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {pagedTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => { setSelected(topic); setContentType(''); }}
                    className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                      selected?.id === topic.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {topic.icon && <span className="text-lg">{topic.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${selected?.id === topic.id ? 'text-purple-700' : 'text-slate-800'}`}>
                          {topic.name}
                        </div>
                        {topic.description && (
                          <div className="text-xs text-slate-400 truncate">{topic.description}</div>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-none">{totalContent(topic)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Pagination page={topicsPage} totalPages={topicsTotalPages} onPage={setTopicsPage} />
          </div>
        </div>

        {/* Topic detail */}
        <div className="col-span-2">
          {!selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400 text-sm">
              Select a topic to view its content
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  {selected.icon && <span className="text-2xl">{selected.icon}</span>}
                  <div>
                    <h2 className="font-semibold text-slate-800">{selected.name}</h2>
                    {selected.description && <p className="text-xs text-slate-400">{selected.description}</p>}
                  </div>
                </div>
                {/* Content type stats */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { type: '', label: 'All', count: totalContent(selected) },
                    { type: 'article', label: 'Articles', count: selected.article_count ?? 0 },
                    { type: 'story', label: 'Stories', count: selected.story_count ?? 0 },
                    { type: 'activity', label: 'Activities', count: selected.activity_count ?? 0 },
                    { type: 'recipe', label: 'Recipes', count: selected.recipe_count ?? 0 },
                  ].map(({ type, label, count }) => (
                    <button
                      key={type || 'all'}
                      onClick={() => setContentType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        contentType === type
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {loadingContent ? (
                  <div className="text-center text-slate-400 text-sm py-8">Loading content…</div>
                ) : topicContent ? (
                  <div className="space-y-5">
                    {(['articles', 'stories', 'activities', 'recipes'] as const).map((type) => {
                      const items = (topicContent[type] as { id: number; title: string }[] | undefined) ?? [];
                      if (!items.length) return null;
                      return (
                        <div key={type}>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2">{type} ({items.length})</div>
                          <div className="grid grid-cols-2 gap-2">
                            {pagedContent
                              .filter((item) => items.some((orig) => orig.id === (item as { id: number }).id))
                              .map((item) => (
                                <div key={(item as { id: number }).id} className={`px-3 py-2 rounded-xl text-xs ${TYPE_COLORS[type.slice(0, -1)] ?? 'bg-slate-50 text-slate-600'}`}>
                                  {(item as { title: string }).title}
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                    {!topicContent.articles?.length && !topicContent.stories?.length && !topicContent.activities?.length && !topicContent.recipes?.length && (
                      <div className="text-center text-slate-400 text-sm py-8">No content linked to this topic</div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-sm py-8">No content found</div>
                )}
              </div>
              <Pagination page={contentPage} totalPages={contentTotalPages} onPage={setContentPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
