'use server';
import * as cheerio from 'cheerio';

import {
  checkGmDate,
  checkNarDate,
  getHtml,
  sanitizeString,
  sortByTitle,
  type Post,
} from '@/lib/utils';

const PA_NEXT_API = process.env.PA_NEXT_API as string;
const NAR_URL = process.env.NAR_URL as string;
const GM_URL = process.env.GM_URL as string;
const GRM_URL = process.env.GRM_URL as string;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;

const results: Post[] = [];

async function getNewReleases(artists: Set<string>, page = 1) {
  const url = page === 1 ? NAR_URL : `${NAR_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('.title > h2 > a')
    .get()
    .map((p) => {
      const title = p.attribs.title.replace('Permanent Link to ', '');

      return {
        id: `${title}-${Date.now()}`,
        link: p.attribs.href,
        title,
      };
    });
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

  return results.sort(sortByTitle);
}

async function getMetalReleases(artists: Set<string>, page = 1) {
  const url = `${GM_URL}/page/${page}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const posts = $('span.ntitle > a')
    .get()
    .map((p) => {
      // @ts-ignore
      const title = p.children[0].data;

      return {
        id: `${title}-${Date.now()}`,
        link: p.attribs.href,
        title,
      };
    });
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

  return results.sort(sortByTitle);
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
        id: `${albums[i]}-${Date.now()}`,
        link: links[i],
        title: `${b} - ${albums[i]}`,
      });
    }
  });

  if (page < 3) {
    return await getRockReleases(artists, page + 1);
  }

  return results.sort(sortByTitle);
}

async function getSpotifyToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  });
  const data = await res.json();

  return data?.access_token ?? null;
}

interface SpotifyItem {
  album_type: string;
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
  id: string;
  name: string;
  release_date: string;
  artists: {
    id: string;
    name: string;
  }[];
}

interface SpotifyData {
  albums: {
    href: string;
    total: number;
    items: SpotifyItem[];
  };
}

export interface Result {
  link: string;
  title: string;
}

export async function getSpotifyReleases(
  artists: Set<string>
): Promise<Result[]> {
  const token = await getSpotifyToken();

  if (!token) return [];

  const res = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=50&offset=0`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data: SpotifyData = await res.json();

  data?.albums?.items.forEach((item) => {
    const artist = sanitizeString(item.artists[0].name);

    if (artists.has(artist)) {
      results.push({
        id: item.id,
        link: item.external_urls.spotify,
        title: `${item.artists[0].name} - ${item.name}`,
      });
    }
  });

  return results.sort(sortByTitle);
}

const fnMap = {
  nar: getNewReleases,
  gm: getMetalReleases,
  grm: getRockReleases,
  spy: getSpotifyReleases,
};

export type FnType = keyof typeof fnMap;

async function getArtists() {
  const res = await fetch(PA_NEXT_API);
  const data = await res.json();

  return data.artists as string[];
}

export async function getData(type: FnType) {
  const data = await getArtists();
  const artists = new Set(data.map((a) => sanitizeString(a)));
  const getFn = fnMap[type];
  const releases = await getFn(artists);

  return releases;
}
