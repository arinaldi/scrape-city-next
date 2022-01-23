import axios from 'axios';

export default async function getArtists() {
  try {
    const { data } = await axios.get(process.env.PA_NEXT_API);
    return data.artists;
  } catch (error) {
    console.error('Error fetching artists:', error.message);
    return [];
  }
}
