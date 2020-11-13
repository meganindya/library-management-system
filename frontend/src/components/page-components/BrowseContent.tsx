import React, { useEffect, useState } from 'react';

import { ICategory } from '../../@types/book';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BrowseGreetContent from './BrowseGreetContent';
import BrowseListContent from './BrowseListContent';

export default function BrowseContent() {
  // -- Data Fetch Operations ----------------------------------------------------------------------

  const [categories, setCategories] = useState<string[]>([]);
  // fetch list of categories on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query {
          categories {
            name
          }
        }`,
        {},
        'categories fetch failed'
      );

      if (!response) return;

      setCategories(response.data.categories.map((category: ICategory) => category.name));
    })();
  }, []);

  const [searchQuery, setSearchQuery] = useState<{ query: string; category: string } | null>(null);

  // -- Render -------------------------------------------------------------------------------------

  return searchQuery ? (
    <BrowseListContent
      categories={categories}
      searchQuery={searchQuery}
      resetGlobalSearchQuery={() => setSearchQuery(null)}
    />
  ) : (
    <BrowseGreetContent categories={categories} setSearchQuery={setSearchQuery} />
  );
}
