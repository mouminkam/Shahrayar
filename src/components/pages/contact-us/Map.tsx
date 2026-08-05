import type { Branch } from "../../../lib/fetchDefaultBranch";

const DEFAULT_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28821.965472924858!2d89.07524545!3d25.4467646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fcb92fb4d9696d%3A0x74b18fed6b93e5e5!2sNobabgonj%20National%20garden!5e0!3m2!1sen!2sbd!4v1724820772279!5m2!1sen!2sbd";

// Helper function to build map URL from branch coordinates
function buildMapUrl(branchDetails: Branch | null): string {
  if (!branchDetails) {
    return DEFAULT_MAP_URL;
  }

  // Get latitude and longitude directly from branchDetails
  const latitude = branchDetails.latitude as string | number | undefined;
  const longitude = branchDetails.longitude as string | number | undefined;

  // Check if coordinates are valid
  if (!latitude || !longitude) {
    return DEFAULT_MAP_URL;
  }

  // Convert to numbers if they're strings
  const lat = parseFloat(String(latitude));
  const lng = parseFloat(String(longitude));

  if (isNaN(lat) || isNaN(lng)) {
    return DEFAULT_MAP_URL;
  }

  // Build Google Maps embed URL with branch coordinates
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1sen!2sbd!4f13.1!5m2!1sen!2sbd`;
}

interface MapProps {
  branchDetails?: Branch | null;
}

export default function Map({ branchDetails = null }: MapProps) {
  const mapUrl = buildMapUrl(branchDetails);

  return (
    <section className="relative w-full h-[550px]">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 border-0"
      ></iframe>
    </section>
  );
}
