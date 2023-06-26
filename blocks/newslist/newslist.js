/**
 * Traverse the whole json structure in data and replace '0' with empty string
 * @param {*} data
 * @returns updated data
 */
function replaceEmptyValues(data) {
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'object') {
      replaceEmptyValues(data[key]);
    } else if (data[key] === '0') {
      data[key] = '';
    }
  });
  return data;
}

async function fetchIndex(indexURL = '/query-index.json') {
  if (window.queryIndex && window.queryIndex[indexURL]) {
    return window.queryIndex[indexURL];
  }
  try {
    const resp = await fetch(indexURL);
    const json = await resp.json();
    replaceEmptyValues(json.data);
    window.queryIndex = window.queryIndex || {};
    window.queryIndex[indexURL] = json.data;
    return json.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`error while fetching ${indexURL}`, e);
    return [];
  }
}

function getHumanReadableDate(dateString) {
  if (!dateString) return dateString;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function convertToKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function filterByQuery(index, query) {
  if (!query) return index;
  const queryTokens = query.split(' ');
  return index.filter((e) => {
    const title = e.title.toLowerCase();
    const subtitle = e.subtitle.toLowerCase();
    const description = e.description.toLowerCase();
    return queryTokens.every((token) => {
      if (subtitle.includes(token)) {
        e['matchedToken'] = `... ${subtitle} ...`;
        return true;
      } else if (description.includes(token)) {
        e['matchedToken'] = `... ${description} ...`;
        return true;
      } else if (title.includes(token)) {
        e['matchedToken'] = `... ${title} ...`;
        return true;
      }
      return false;
    });
  });
}

export default async function decorate(block) {
  const limit = 10;
  // get request parameter page as limit
  const usp = new URLSearchParams(window.location.search);
  const pageOffset = parseInt(usp.get('page'), 10) || 0;
  const offset = pageOffset * 10;
  const l = offset + limit;
  let filter = document.querySelector('.newslist.block').innerText || '';
  filter = filter.trim();
  const isSearch = filter === 'query';
  let key;
  let value;
  let shortIndex;
  const index = await fetchIndex();
  if (isSearch) {
    shortIndex = filterByQuery(index, usp.get('q'));
  } else if (filter.length > 0) {
    const filterTokens = filter.split(':');
    if (filterTokens.length !== 2) {
      block.innerHTML = `Invalid filter ${filter}`;
      return;
    }
    key = filterTokens[0].trim().toLowerCase();
    value = filterTokens[1].trim().toLowerCase();
    shortIndex = index.filter((e) => (e[key].toLowerCase() === value));
  } else {
    shortIndex = index;
  }
  const newsListContainer = document.createElement('div');
  newsListContainer.classList.add('newslist-container');
  if (isSearch) {
    const searchHeader = document.createElement('div');
    searchHeader.classList.add('search-header-container');
    searchHeader.innerHTML = `
      <h2>Search Results</h2>
      <form action="/search" method="get" id="search-form">
        <div class="search-container" >
          <label for="edit-keys">Enter your keywords </label>
          <input type="text" id="search-input" name="q" value="${usp.get('q')}" size="40" maxlength="255">
        </div>
        <input type="submit" value="Search">
      </form>
    `;
    newsListContainer.append(searchHeader);
  } else if (key && value) {
    const header = document.createElement('h2');
    header.innerText = value;
    newsListContainer.append(header);
  }
  const range = document.createRange();

  for (let i = offset; i < l && i < shortIndex.length; i += 1) {
    const e = shortIndex[i];
    let itemHtml;
    if (isSearch) {
      itemHtml = `
      <div class="search-resultslist-item">
        <div class="search-resultslist-item-header">
          <a href="${e.path}">${e.title}</a>
        </div>
        <div class="search-resultslist-item-content">${e.matchedToken || subtitle}</div>
        <div class="search-resultslist-item-details">
          <a href="/users/${convertToKebabCase(e.author)}">${e.author}</a> - ${getHumanReadableDate(e.publisheddate)}
        </div>
      </div>

      `;
    } else if (key && value) {
      itemHtml = `
      <div class="resultslist-item">
        <div class="resultslist-item-header">
          <a href="${e.path}">${e.title}</a>
        </div>
        <div class="resultslist-item-content">${e.subtitle}</div>
        <div class="resultslist-item-details">
          Author: <a href="/users/${convertToKebabCase(e.author)}">${e.author}</a> ${getHumanReadableDate(e.publisheddate)} &nbsp;&nbsp; | &nbsp; Vertical: <b> <a href="/vertical/${e.vertical}">${e.vertical}</a></b>
        </div>
      </div>
    `;
    } else {
      itemHtml = `
        <div class="newslist-item">
          <div class="newslist-item-photo">
            <a href="${e.path}"><img src="${e.image}" alt="${e.title}"></a>
          </div>
          <div class="newslist-item-content">
            <div class="newslist-item-header">
              <a href="${e.path}">${e.title}</a>
            </div>
            <div class="newslist-item-subheader">
              ${getHumanReadableDate(e.publisheddate)} | Author: <a href="/users/${convertToKebabCase(e.author)}">${e.author}</a>
            </div>
            <div class="newslist-item-main">
              <p>${e.subtitle}</p>
            </div>
            <div class="newslist-item-footer">
              Category: <a href="/application/${e.application}">${e.application}</a> <br>
              Vertical: <a href="/vertical/${e.vertical}">${e.vertical}</a> <br>
              Partners: <a href="/partner/${e['featured-sis']}">${e['featured-sis']}</a> <br>
            </div>
          </div>
        </div>
      `;
    }
    const item = range.createContextualFragment(itemHtml);
    newsListContainer.append(item);
  }

  // add pagination information
  if (shortIndex.length > l || pageOffset > 0) {
    const prev = pageOffset > 0 ? `<a href="?page=${parseInt(pageOffset, 10) - 1}">‹ previous</a>` : '';
    const next = shortIndex.length > l ? `<a href="?page=${parseInt(pageOffset, 10) + 1}">next ›</a>` : '';
    const paginationHtml = `
      <div class="pagination">
        ${prev}  <b>${parseInt(pageOffset, 10) + 1} of ${Math.ceil(shortIndex.length / 10)}</b> ${next}
      </div>
    `;
    newsListContainer.append(range.createContextualFragment(paginationHtml));
  }

  block.innerHTML = newsListContainer.outerHTML;
}
