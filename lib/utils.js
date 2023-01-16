import axios from 'axios';
import subtract from 'date-fns/sub';
import isAfter from 'date-fns/isAfter';

export function checkNarDate(lastPostDate) {
  const dateString = lastPostDate.replace(' On ', '').replace(/-/g, '');
  const postDate = new Date(dateString);
  const dateToCheck = subtract(new Date(), { days: 2 });
  const shouldContinue = isAfter(postDate, dateToCheck);

  return shouldContinue;
}

export function checkGmDate(lastPostDate) {
  const [_, dateString] = lastPostDate.split('| ');
  const shouldContinue =
    dateString.startsWith('Today') || dateString.startsWith('Yesterday');

  return shouldContinue;
}

const config = {
  headers: {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua':
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  },
};

export async function getHtml(url) {
  const { data: html } = await axios.get(url, config);
  return html;
}

export function sanitizeString(value) {
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

export function sortData(data) {
  return data.sort((a, b) =>
    a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
  );
}
