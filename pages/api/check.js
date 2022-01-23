import getArtists from '../../lib/getArtists';
import getReleases from '../../lib/getReleases';

import sendMail from '../../lib/mailer';
import {
  getHtmlResults,
  getTextResults,
  sanitizeString,
} from '../../lib/utils';

function generateMail(releases) {
  if (releases.length === 0) {
    const message = 'No results today';
    const htmlMessage = `<p>${message}</p>`;

    sendMail(htmlMessage, message);
    return;
  }

  const html = getHtmlResults(releases);
  const text = getTextResults(releases);

  sendMail(html, text);
}

export default async function handler(_, res) {
  try {
    const data = await getArtists();
    const artists = new Set(data.map((artist) => sanitizeString(artist)));

    const releases = await getReleases(artists);
    // generateMail(releases);

    res.status(200).json({ success: true, releases });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
