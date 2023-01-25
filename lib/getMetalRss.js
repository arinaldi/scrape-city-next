import * as cheerio from 'cheerio';

import { getHtml, sanitizeString, sortData } from './utils';

const results = [];
const GM_URL = process.env.GM_URL;

export default async function getMetalRss(artists) {
  const url = `${GM_URL}/rss.xml`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('item')
    .get()
    .map((post) => {
      const title = $(post).find('title').text();
      const link = $(post).find('guid').text();

      return { title, link };
    });

  posts.forEach((post) => {
    const enDashIndex = post.title.indexOf('-');
    const title = post.title.substring(0, enDashIndex);
    const artist = sanitizeString(title);

    if (artists.has(artist)) {
      results.push(post);
    }
  });

  return results.length > 0 ? sortData(results) : results;
}
