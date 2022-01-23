import axios from 'axios';
import subtract from 'date-fns/sub';
import isAfter from 'date-fns/isAfter';

export function checkDate(lastPostDate) {
  const dateString = lastPostDate.replace(' On ', '').replace(/-/g, '');
  const postDate = new Date(dateString);
  const dateToCheck = subtract(new Date(), { days: 2 });
  const shouldContinue = isAfter(postDate, dateToCheck);

  return shouldContinue;
}

export async function getHtml(url) {
  const { data: html } = await axios.get(url);
  return html;
}

export function sanitizeString(value) {
  return value
    .trim()
    .toLowerCase()
    .replace('&', 'and')
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
