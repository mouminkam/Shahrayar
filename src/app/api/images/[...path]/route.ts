/**
 * API Route: Image Proxy
 *
 * Proxies images from shahrayar.peaklink.pro to solve CORS issues.
 *
 * Usage:
 * GET /api/images/storage/website-slides/image.png
 * Proxies to: https://shahrayar.peaklink.pro/storage/website-slides/image.png
 *
 * This route fetches images from the API server, adds CORS headers,
 * caches aggressively, and handles errors gracefully.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";
const API_DOMAIN = API_BASE_URL.replace("/api/v1", "");

const FETCH_TIMEOUT = 10000;
const CACHE_MAX_AGE = 31536000;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }): Promise<Response> {
  try {
    const resolvedParams = await params;

    const pathSegments = resolvedParams.path || [];
    const imagePath = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments;

    if (!imagePath || imagePath.trim() === "") {
      return new Response("Image path is required", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    const imageUrl = `${API_DOMAIN}${cleanPath}`;

    if (!imageUrl.startsWith(API_DOMAIN)) {
      return new Response("Invalid image source", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullImageUrl = queryString ? `${imageUrl}?${queryString}` : imageUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const imageResponse = await fetch(fullImageUrl, {
        method: "GET",
        signal: controller.signal,
        headers: { "User-Agent": "Next.js Image Proxy" },
        cache: "force-cache",
        next: { revalidate: 31536000 },
      });

      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        if (imageResponse.status === 404) {
          return new Response("Image not found", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }

        return new Response(`Failed to fetch image: ${imageResponse.status}`, {
          status: imageResponse.status || 500,
          headers: { "Content-Type": "text/plain" },
        });
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      let contentType = imageResponse.headers.get("Content-Type");
      if (!contentType) {
        const extension = imagePath.split(".").pop()?.toLowerCase() || "";
        contentType = CONTENT_TYPES[extension] || "image/jpeg";
      }

      const contentLength = imageResponse.headers.get("Content-Length") || imageBuffer.byteLength.toString();

      return new Response(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": contentLength,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, immutable`,
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if ((fetchError as Error).name === "AbortError") {
        return new Response("Request timeout", {
          status: 504,
          headers: { "Content-Type": "text/plain" },
        });
      }

      console.error("Image proxy fetch error:", fetchError);
      return new Response("Failed to fetch image", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
