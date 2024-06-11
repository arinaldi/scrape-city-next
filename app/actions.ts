'use server';
import * as cheerio from 'cheerio';

import {
  checkGmDate,
  checkNarDate,
  getHtml,
  sanitizeString,
  sortData,
  type Post,
} from '@/lib/utils';

const PA_NEXT_API = process.env.PA_NEXT_API as string;
const NAR_URL = process.env.NAR_URL as string;
const GM_URL = process.env.GM_URL as string;
const GRM_URL = process.env.GRM_URL as string;

async function getArtists() {
  const res = await fetch(PA_NEXT_API);
  const data = await res.json();

  return data.artists as string[];
}

const results: Post[] = [];

async function getNewReleases(artists: Set<string>, page = 1) {
  const url = page === 1 ? NAR_URL : `${NAR_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('.title > h2 > a')
    .get()
    .map((p) => ({
      title: p.attribs.title.replace('Permanent Link to ', ''),
      link: p.attribs.href,
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
    .map((p) => ({
      // @ts-ignore
      title: p.children[0].data,
      link: p.attribs.href,
    }));
  const lastPostDate = $('td.slink > strong').last().parent().text();
  const shouldContinue = checkGmDate(lastPostDate);

  posts.forEach((p) => {
    const enDashIndex = p.title.indexOf('-');
    const title = p.title.substring(0, enDashIndex);
    const artist = sanitizeString(title);

    if (artists.has(artist)) {
      results.push(p);
    }
  });

  if (shouldContinue) {
    return await getMetalReleases(artists, page + 1);
  }

  return results.length > 0 ? sortData(results) : results;
}

async function getRockReleases(artists: Set<string>, page = 1) {
  const url = page === 1 ? GRM_URL : `${GRM_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const bands = $('div.ssinfo > a')
    .get()
    .map((p) => p.attribs.title);
  const albums = $('ul.ssigcrf')
    .get()
    // @ts-ignore);
    .map((a, i) => a.previousSibling?.data.trim());
  const links = $('div.ssdownload > a')
    .get()
    .map((l) => l.attribs.href);

  bands.forEach((b, i) => {
    const artist = sanitizeString(b);

    if (artists.has(artist)) {
      results.push({
        title: `${b} - ${albums[i]}`,
        link: links[i],
      });
    }
  });

  if (page < 3) {
    return await getRockReleases(artists, page + 1);
  }

  return results.length > 0 ? sortData(results) : results;
}

const fnMap = {
  nar: getNewReleases,
  gm: getMetalReleases,
  grm: getRockReleases,
};

export type FnType = keyof typeof fnMap;

export async function getData(type: FnType) {
  const data = await getArtists();
  const artists = new Set(data.map((a) => sanitizeString(a)));
  const getFn = fnMap[type];
  const releases = await getFn(artists);

  return releases;
}
