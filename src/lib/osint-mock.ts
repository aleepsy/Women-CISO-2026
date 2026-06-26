// Generador de resultados OSINT simulados (estilo SpiderFoot).
// Reemplaza generateMockResults() por una llamada real a la API de SpiderFoot
// cuando tengas la instancia disponible.

export type QueryType = "username" | "domain" | "email";

export interface OsintResult {
  id: string;
  module: string;
  type: string;
  source: string;
  data: string;
  risk: "info" | "low" | "medium" | "high";
  discoveredAt: string;
}

const MODULES_BY_TYPE: Record<QueryType, { module: string; type: string; data: (q: string) => string; risk: OsintResult["risk"] }[]> = {
  username: [
    { module: "sfp_accounts", type: "ACCOUNT_EXTERNAL_OWNED", data: (q) => `github.com/${q}`, risk: "info" },
    { module: "sfp_accounts", type: "ACCOUNT_EXTERNAL_OWNED", data: (q) => `twitter.com/${q}`, risk: "info" },
    { module: "sfp_accounts", type: "ACCOUNT_EXTERNAL_OWNED", data: (q) => `reddit.com/user/${q}`, risk: "low" },
    { module: "sfp_accounts", type: "ACCOUNT_EXTERNAL_OWNED", data: (q) => `instagram.com/${q}`, risk: "low" },
    { module: "sfp_keybase", type: "PGP_KEY", data: (q) => `keybase.io/${q} (PGP key ABCD...1234)`, risk: "info" },
    { module: "sfp_haveibeenpwned", type: "EMAILADDR_COMPROMISED", data: (q) => `${q}@gmail.com filtrado en Adobe (2013)`, risk: "high" },
    { module: "sfp_hunter", type: "EMAILADDR", data: (q) => `${q}@protonmail.com`, risk: "medium" },
    { module: "sfp_dehashed", type: "PASSWORD_COMPROMISED", data: () => `hash bcrypt encontrado en breach 2021`, risk: "high" },
  ],
  domain: [
    { module: "sfp_dnsresolve", type: "IP_ADDRESS", data: () => `185.199.108.153`, risk: "info" },
    { module: "sfp_dnsresolve", type: "IP_ADDRESS", data: () => `2606:50c0:8000::153`, risk: "info" },
    { module: "sfp_whois", type: "DOMAIN_REGISTRAR", data: () => `GoDaddy.com, LLC`, risk: "info" },
    { module: "sfp_whois", type: "DOMAIN_REGISTRANT", data: () => `Privacy protected — Domains By Proxy`, risk: "info" },
    { module: "sfp_sslcert", type: "SSL_CERTIFICATE_ISSUED", data: (q) => `*.${q} (Let's Encrypt, expira en 67 días)`, risk: "low" },
    { module: "sfp_crt", type: "INTERNET_NAME", data: (q) => `mail.${q}, vpn.${q}, dev.${q}`, risk: "medium" },
    { module: "sfp_shodan", type: "TCP_PORT_OPEN", data: () => `22, 80, 443, 8080, 8443`, risk: "medium" },
    { module: "sfp_shodan", type: "VULNERABILITY", data: () => `CVE-2023-44487 (HTTP/2 Rapid Reset)`, risk: "high" },
    { module: "sfp_virustotal", type: "MALICIOUS_INTERNET_NAME", data: () => `0/89 motores detectan amenaza`, risk: "info" },
    { module: "sfp_dnsbrute", type: "INTERNET_NAME", data: (q) => `staging.${q}`, risk: "low" },
  ],
  email: [
    { module: "sfp_emailrep", type: "EMAILADDR_DELIVERABLE", data: () => `Entregable — reputación: media`, risk: "info" },
    { module: "sfp_haveibeenpwned", type: "EMAILADDR_COMPROMISED", data: () => `Filtrado en LinkedIn (2012), Dropbox (2016)`, risk: "high" },
    { module: "sfp_dehashed", type: "PASSWORD_COMPROMISED", data: () => `2 contraseñas en texto plano encontradas`, risk: "high" },
    { module: "sfp_hunter", type: "AFFILIATE_COMPANY_NAME", data: (q) => `Asociado a dominio ${q.split("@")[1] ?? "ejemplo.com"}`, risk: "low" },
    { module: "sfp_gravatar", type: "HUMAN_NAME", data: () => `John D.`, risk: "info" },
    { module: "sfp_gravatar", type: "AVATAR", data: (q) => `gravatar.com/${q.split("@")[0]}`, risk: "info" },
    { module: "sfp_socialprofiles", type: "ACCOUNT_EXTERNAL_OWNED", data: (q) => `linkedin.com/in/${q.split("@")[0]}`, risk: "low" },
  ],
};

function pseudoRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMockResults(type: QueryType, query: string): OsintResult[] {
  const rand = pseudoRandom(`${type}:${query}`);
  const entries = MODULES_BY_TYPE[type];
  const now = Date.now();
  return entries.map((e, i) => {
    const minutesAgo = Math.floor(rand() * 60 * 24 * 7);
    return {
      id: `${type}-${i}-${Math.floor(rand() * 1e9)}`,
      module: e.module,
      type: e.type,
      source: e.module.replace("sfp_", ""),
      data: e.data(query),
      risk: e.risk,
      discoveredAt: new Date(now - minutesAgo * 60_000).toISOString(),
    };
  });
}

export function toCSV(rows: OsintResult[]): string {
  const header = ["id", "module", "type", "source", "data", "risk", "discoveredAt"];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(header.map((h) => esc(String(r[h as keyof OsintResult]))).join(","));
  }
  return lines.join("\n");
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
