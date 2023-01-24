export default async function getArtists() {
  try {
    const res = await fetch(process.env.PA_NEXT_API);
    const data = await res.json();
    return data.artists;
  } catch (error) {
    console.error('Error fetching artists:', error.message);
    return [];
  }
}
