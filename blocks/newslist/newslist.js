async function fetchIndex(indexURL) {
  try {
    const resp = await fetch(indexURL);
    const json = await resp.json();
    // eslint-disable-next-line no-console
    return json.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`error while fetching ${indexURL}`, e);
    return [];
  }
}

function getHumanReadableDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function convertToKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

export default async function decorate(block) {
  const limit = 10;
  // get request parameter page as limit
  const usp = new URLSearchParams(window.location.search);
  const offset = usp.get("page") || 1;
  const filter = document.querySelector(".newslist.block").innerText;
  let key, value;
  if (filter) {
    const filterTokens = filter.split(":");
    if (filterTokens.length !== 2) {
      console.log("invalid filter", filter);
      block.innerHTML = `Invalid filter ${filter}`;
      return;
    }
    key = filterTokens[0].trim().toLowerCase();
    value = filterTokens[1].trim().toLowerCase();
  }
  const indexURL = '/query-index.json';
  const index = await fetchIndex(indexURL);
  const shortIndex = key && value ? index.filter((e) => (e[key].toLowerCase() === value)) : index;
  console.log(shortIndex);
  const newsListContainer = document.createElement("div");
  newsListContainer.classList.add("newslist-container");
  if (key && value) {
    const header = document.createElement("h2");
    header.innerText = value;
    newsListContainer.append(header);
  }
  const range = document.createRange();

  shortIndex.forEach((e) => {
    let itemHtml;
    if (key && value) {
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
  });

  block.innerHTML = newsListContainer.outerHTML;
}