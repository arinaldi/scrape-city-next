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
    'User-Agent':
      // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  },
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
