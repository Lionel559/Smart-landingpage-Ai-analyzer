const BLOCKED_EXACT_HOSTS = new Set([
  "localhost",
  "local",
  "internal",
  "intranet",
  "router",
  "gateway",
  "broadcasthost",
]);

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".intranet",
  ".lan",
  ".home",
  ".corp",
  ".test",
  ".invalid",
  ".example",
];

type ValidScanUrl = {
  ok: true;
  url: string;
};

type InvalidScanUrl = {
  ok: false;
  error: string;
};

export type ScanUrlValidationResult = ValidScanUrl | InvalidScanUrl;

function normalizeScanUrlInput(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  return trimmed.includes(".") ? `https://${trimmed}` : trimmed;
}

function parseIpv4(hostname: string) {
  const parts = hostname.split(".");

  if (parts.length !== 4) {
    return null;
  }

  const octets = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) {
      return Number.NaN;
    }

    return Number(part);
  });

  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets as [number, number, number, number];
}

function isBlockedIpv4(hostname: string) {
  const ip = parseIpv4(hostname);

  if (!ip) {
    return false;
  }

  const [first, second, third] = ip;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113)
  );
}

function isBlockedIpv6(hostname: string) {
  const cleanHost = hostname.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();

  if (!cleanHost.includes(":")) {
    return false;
  }

  if (
    cleanHost === "::" ||
    cleanHost === "::1" ||
    cleanHost.startsWith("fc") ||
    cleanHost.startsWith("fd") ||
    cleanHost.startsWith("fe8") ||
    cleanHost.startsWith("fe9") ||
    cleanHost.startsWith("fea") ||
    cleanHost.startsWith("feb") ||
    cleanHost.startsWith("ff") ||
    cleanHost.startsWith("2001:db8:")
  ) {
    return true;
  }

  if (cleanHost.startsWith("::ffff:")) {
    return isBlockedIpv4(cleanHost.slice("::ffff:".length));
  }

  return false;
}

function isBlockedHostname(hostname: string) {
  const cleanHost = hostname.toLowerCase().replace(/\.$/, "");

  if (!cleanHost || BLOCKED_EXACT_HOSTS.has(cleanHost)) {
    return true;
  }

  if (!cleanHost.includes(".") && !cleanHost.includes(":")) {
    return true;
  }

  return BLOCKED_HOST_SUFFIXES.some((suffix) => cleanHost.endsWith(suffix));
}

export function validateScanUrl(url: string): ScanUrlValidationResult {
  const normalized = normalizeScanUrlInput(url);

  if (!normalized) {
    return {
      ok: false,
      error: "Please provide a landing page URL.",
    };
  }

  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    return {
      ok: false,
      error: "Please provide a valid public http or https URL.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      ok: false,
      error: "Only public http and https URLs can be scanned.",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      ok: false,
      error: "URLs with embedded credentials cannot be scanned.",
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");

  if (
    isBlockedHostname(hostname) ||
    isBlockedIpv4(hostname) ||
    isBlockedIpv6(hostname)
  ) {
    return {
      ok: false,
      error: "Only public landing page URLs can be scanned.",
    };
  }

  return {
    ok: true,
    url: parsed.toString(),
  };
}
