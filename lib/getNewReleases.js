import cheerio from 'cheerio';

import { checkNarDate, getHtml, sanitizeString, sortData } from './utils';

const results = [];
const NAR_URL = process.env.NAR_URL;

export default async function getNewReleases(artists, page = 1) {
  const url = page === 1 ? NAR_URL : `${NAR_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('.title > h2 > a')
    .get()
    .map((post) => ({
      title: post.attribs.title.replace('Permanent Link to ', ''),
      link: post.attribs.href,
    }));
  const lastPostDate = $('.clock').last().text();
  const shouldContinue = checkNarDate(lastPostDate);

  posts.forEach((post) => {
    const enDashIndex = post.title.indexOf('–');
    const title = post.title.substring(0, enDashIndex);
    const artist = sanitizeString(title);

    if (artists.has(artist)) {
      results.push(post);
    }
  });

  if (shouldContinue) {
    return await getNewReleases(artists, page + 1);
  }

  return results.length > 0 ? sortData(results) : results;
}
