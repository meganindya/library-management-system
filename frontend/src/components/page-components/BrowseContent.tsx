import React, { useEffect, useState } from 'react';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BrowseGreetContent from './BrowseGreetContent';
import BrowseListContent from './BrowseListContent';

export default function BrowseContent() {
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<{
    queryString: string;
    queryCategory: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query {
          categories {
            categoryName
          }
        }`,
        {},
        'Categories Fetch Failed'
      );

      if (!response) return;

      setCategories(response.data.categories.map((category: any) => category.categoryName));
    })();
  }, []);

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
