import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sub } from 'date-fns/sub';
import { isAfter } from 'date-fns/isAfter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkNarDate(lastPostDate: string) {
  const dateString = lastPostDate.replace(' On ', '').replace(/-/g, '');
  const postDate = new Date(dateString);
  const dateToCheck = sub(new Date(), { days: 2 });
  const shouldContinue = isAfter(postDate, dateToCheck);

  return shouldContinue;
}

export function checkGmDate(lastPostDate: string) {
  const [_, dateString] = lastPostDate.split('| ');

  if (!dateString) return false;

  const shouldContinue =
    dateString.startsWith('Today') || dateString.startsWith('Yesterday');

  return shouldContinue;
}

const config: RequestInit = {
  headers: {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    // 'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    // Connection: 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua':
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none', // 'cross-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
  // mode: 'cors',
  // credentials: 'include',
};

export async function getHtml(url: string) {
  const res = await fetch(url, config);
  const html = await res.text();

  return html;
}

export function sanitizeString(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace('&', 'and')
    .replace(/'/g, '')
    .replace(/’/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\?/g, '')
    .replace(/-/g, '')
    .replace(/é/g, 'e')
    .replace(/ö/g, 'o');
}

export interface Post {
  id: string;
  link: string;
  title: string;
}

export function sortByTitle(a: Post, b: Post) {
  return a.title.localeCompare(b.title);
}
