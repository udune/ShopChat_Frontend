interface ImageBaseUrls {
  development: string;
  production: string;
}

const IMAGE_BASE_URLS: ImageBaseUrls = {
  development: "https://storage.googleapis.com/feedshop-uploads",
  production: "https://storage.googleapis.com/feedshop-uploads",
};

// 현재 환경에 따른 베이스 URL 선택
export const getImageBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return IMAGE_BASE_URLS.development;
  }

  const hostname = window.location.hostname;

  const isProduction =
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    !hostname.includes("localhost");

  return isProduction
    ? IMAGE_BASE_URLS.production
    : IMAGE_BASE_URLS.development;
};

// Mock URL을 실제 CDN URL로 변환하는 함수
export const convertMockUrlToCdnUrl = (url: string): string => {
  if (!url) return url;

  // mock-gcp-bucket URL을 실제 CDN URL로 변환
  if (url.includes("mock-gcp-bucket")) {
    const baseUrl = getImageBaseUrl();
    return url.replace("https://mock-gcp-bucket", baseUrl);
  }

  return url;
};

/**
 * 상대 경로를 전체 GCS URL로 변환
 */
export const toUrl = (
  relativePath: string | undefined | null,
  fallbackPath: string = "images/common/no-image.png"
): string => {
  try {
    const path = relativePath || fallbackPath;

    // 이미 전체 URL인 경우 그대로 반환
    if (
      path.includes("dev.cdn-feedshop.store") ||
      path.includes("cdn-feedshop.store")
    ) {
      return path;
    }

    const baseUrl = getImageBaseUrl();

    // 경로 앞 슬래시 제거
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${baseUrl}/${cleanPath}`;
  } catch (error) {
    const baseUrl = getImageBaseUrl();

    // 경로 앞 슬래시 제거
    const cleanFallback = fallbackPath.startsWith("/")
      ? fallbackPath.substring(1)
      : fallbackPath;
    return `${baseUrl}/${cleanFallback}`;
  }
};
