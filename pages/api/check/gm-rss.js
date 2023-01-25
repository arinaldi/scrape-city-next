import getArtists from '../../../lib/getArtists';
import getMetalRss from '../../../lib/getMetalRss';
import { sanitizeString } from '../../../lib/utils';

export default async function handler(req, res) {
  if (process.env.NEXT_PUBLIC_APP_KEY === req.headers.authorization) {
    try {
      const data = await getArtists();
      const artists = new Set(data.map((artist) => sanitizeString(artist)));
      const releases = await getMetalRss(artists);

      res.status(200).json({ success: true, releases });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
}
