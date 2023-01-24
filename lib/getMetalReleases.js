import cheerio from 'cheerio';

import { checkGmDate, getHtml, sanitizeString, sortData } from './utils';

const results = [];
const GM_URL = process.env.GM_URL;

export default async function getMetalReleases(artists, page = 1) {
  const url = `${GM_URL}/page/${page}`;
  console.log({ url });
  const html = await getHtml(url);
  console.log('html', html.length);
  const $ = cheerio.load(html);
  const posts = $('span.ntitle > a')
    .get()
    .map((post) => ({
      title: post.children[0].data,
      link: post.attribs.href,
    }));
  const lastPostDate = $('td.slink > strong').last().parent().text();
  const shouldContinue = checkGmDate(lastPostDate);

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

  return results.length > 0 ? sortData(results) : results;
}
