/** Known commercial service contexts; private form content never travels in a URL. */
const services = new Set([
  "website-design-development",
  "web-applications",
  "marketplace-platforms",
  "ui-ux-systems",
  "integrations",
  "dashboards",
  "salvage-marketplace",
  "digital-creator-system",
  "ste-systems",
]);

/**
 * Retains only validated public consultation provenance while consuming saved design settings.
 * A return requires one source. The service is retained when supplied once and recognized.
 * @param search Incoming URL query; unrelated values and private text are discarded.
 * @returns A normalized query string including its leading question mark, or an empty string.
 */
export function retainedConsultationSearch(search: string): string {
  if (search.length > 2000) return "";
  const params = new URLSearchParams(search);
  const sources = params.getAll("source");
  if (sources.length !== 1 || sources[0] !== "customized-platforms") return "";
  const retained = new URLSearchParams({ source: "customized-platforms" });
  const [service, ...duplicates] = params.getAll("service");
  if (service && duplicates.length === 0 && services.has(service))
    retained.set("service", service);
  return `?${retained}`;
}

/**
 * Resolves a fixed commercial return destination for studio visits from Customized Platforms.
 * @param search Public URL query, excluding private project copy and notes.
 * @returns A trusted consultation URL or null for an ordinary studio visit.
 */
export function consultationReturn(search: string): string | null {
  const retained = retainedConsultationSearch(search);
  if (!retained) return null;
  const target = new URL("https://customizedplatforms.com/contact");
  const service = new URLSearchParams(retained).get("service");
  if (service) target.searchParams.set("context", service);
  return target.href;
}
