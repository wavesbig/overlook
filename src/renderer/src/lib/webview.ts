export const UA_PC =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
export const UA_MOBILE =
  'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'

export function isValidUrl(url: string): boolean {
  const re = /^(https?:\/\/)?([\w.-]+)\.[a-zA-Z]{2,}(?:[\/\w#?&=.-]*)$/
  return re.test(url)
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
