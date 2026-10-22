import LocationPage, { locationMetadata, locations } from '../location-page';
const location = locations[3];
export const metadata = locationMetadata(location);
export default function Page() { return <LocationPage location={location} />; }
