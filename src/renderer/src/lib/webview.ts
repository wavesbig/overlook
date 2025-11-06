export const UA_PC =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
export const UA_MOBILE =
  'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'

export function isValidUrl(url: string): boolean {
  const input = url.trim()

  // If protocol is present, rely on URL parsing for robust validation
  if (/^https?:\/\//i.test(input)) {
    try {
      // new URL will throw on invalid URLs
      // Accept http/https only
      const u = new URL(input)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Allow domain without protocol (supports subdomains and optional port/path)
  const domainRe = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/

  // Allow localhost or 127.0.0.1 with optional port/path
  const localRe = /^(localhost|127\.0\.0\.1)(?::\d+)?(?:\/[^\s]*)?$/

  // Allow IPv4 addresses with optional port/path
  const ipv4Re =
    /^((25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)(?::\d+)?(?:\/[^\s]*)?$/

  return domainRe.test(input) || localRe.test(input) || ipv4Re.test(input)
}

export function normalizeUrl(url: string): string {
  if (!/^https?:\/\//.test(url)) {
    return `https://${url}`
  }
  return url
}

export function getSearchUrl(keyword: string): string {
  const q = encodeURIComponent(keyword)
  return `https://www.google.com/search?q=${q}`
}

export function highlightSelectorScript(selector: string): string {
  return `
    try {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (el) {
        document.body.innerHTML = '';
        document.body.appendChild(el);
      }
    } catch (e) { /* ignore */ }
  `
}
