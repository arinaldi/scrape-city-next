import cheerio from 'cheerio';

import { getGmDate, getHtml, sanitizeString, sortData } from './utils';

const results = [];
const GM_URL = process.env.GM_URL;

export default async function getMetalReleases(artists, page = 1) {
  const url = `${GM_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('span.ntitle > a')
    .get()
    .map((post) => ({
      title: post.children[0].data,
      link: post.attribs.href,
    }));
  const lastPostDate = $('td.slink > strong').last().parent().text();
  const shouldContinue = getGmDate(lastPostDate);

  posts.forEach((post) => {
    const enDashIndex = post.title.indexOf('-');
    const title = post.title.substring(0, enDashIndex);
    const artist = sanitizeString(title);

    if (artists.has(artist)) {
      results.push(post);
    }
  });

  if (shouldContinue) {
    return await getMetalReleases(artists, page + 1);
  }

  return results;
}
