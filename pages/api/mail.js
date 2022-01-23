import getArtists from '../../lib/getArtists';
import getReleases from '../../lib/getReleases';

import sendMail from '../../lib/mailer';
import {
  getHtmlResults,
  getTextResults,
  sanitizeString,
} from '../../lib/utils';

async function generateMail() {
  try {
    const data = await getArtists();
    const artists = new Set(data.map((artist) => sanitizeString(artist)));
    const releases = await getReleases(artists);

    if (releases.length === 0) {
      const message = 'No results today';
      const htmlMessage = `<p>${message}</p>`;

      sendMail(htmlMessage, message);
      return;
    }

    const html = getHtmlResults(releases);
    const text = getTextResults(releases);

    sendMail(html, text);
  } catch (error) {
    console.log('Error: ', error.message);
  }
}

export default async function handler(req, res) {
  const APP_KEY = process.env.APP_KEY;
  const ACTION_KEY = req.headers.authorization;

  if (req.method === 'POST') {
    if (ACTION_KEY === APP_KEY) {
      generateMail();
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}
