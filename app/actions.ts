'use server';
import cheerio from 'cheerio';

import {
  checkGmDate,
  checkNarDate,
  getHtml,
  sanitizeString,
  sortData,
  type Post,
} from '@/lib/utils';

async function getArtists() {
  const res = await fetch(process.env.PA_NEXT_API!);
  const data = await res.json();

  return data.artists as string[];
}

const NAR_URL = process.env.NAR_URL!;
const GM_URL = process.env.GM_URL!;
const results: Post[] = [];

async function getNewReleases(artists: Set<string>, page = 1) {
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

async function getMetalReleases(artists: Set<string>, page = 1) {
  const url = `${GM_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('span.ntitle > a')
    .get()
    .map((post) => ({
      // @ts-ignore
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

const fnMap = {
  nar: getNewReleases,
  gm: getMetalReleases,
};

export type FnType = keyof typeof fnMap;

export async function getData(type: FnType) {
  const data = await getArtists();
  const artists = new Set(data.map((artist) => sanitizeString(artist)));
  const getFn = fnMap[type];
  const releases = await getFn(artists);

  return releases;
}
