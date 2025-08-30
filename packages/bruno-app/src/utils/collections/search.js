import { flattenItems, isItemARequest } from './index';
import filter from 'lodash/filter';
import find from 'lodash/find';
import get from 'lodash/get';

export const doesRequestMatchSearchText = (request, searchText = '') => {
  if (!searchText || !searchText.trim()) {
    return true;
  }
  
  const searchTextLower = searchText.toLowerCase().trim();
  // Check if name matches
  if (request?.name?.toLowerCase().includes(searchTextLower)) {
    return true;
  }
  
  // check if tags match
  const tags =  get(request, 'tags', []);
  
  // Check if this is a tag-specific search (format: "tag: abc,def,ghi")
  if (searchTextLower.startsWith('tag:')) {
    const tagQuery = searchTextLower.substring(4).trim(); // Remove "tag:" prefix
    if (!tagQuery) {
      return true; // If just "tag:" is typed, show all requests
    }
    
    // Split by comma and trim each tag
    const searchTags = tagQuery.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    if (searchTags.length === 0) {
      return true;
    }
    
    // Check if the request has ANY of the specified tags (OR logic)
    return searchTags.some(searchTag => 
      tags.some(requestTag => 
        requestTag.toLowerCase().includes(searchTag)
      )
    );
  }
  return false;
};

export const doesFolderHaveItemsMatchSearchText = (item, searchText = '') => {
  let flattenedItems = flattenItems(item.items);
  let requestItems = filter(flattenedItems, (item) => isItemARequest(item));

  return find(requestItems, (request) => doesRequestMatchSearchText(request, searchText));
};

export const doesCollectionHaveItemsMatchingSearchText = (collection, searchText = '') => {
  let flattenedItems = flattenItems(collection.items);
  let requestItems = filter(flattenedItems, (item) => isItemARequest(item));

  return find(requestItems, (request) => doesRequestMatchSearchText(request, searchText));
};
