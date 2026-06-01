// Avaliação mínima de robots.txt: grupo do nosso User-Agent (ou *),
// com decisão por maior-match entre Allow e Disallow.

type RobotsRule = { allow: boolean; path: string };
type RobotsGroup = { agents: string[]; rules: RobotsRule[] };

function parseGroups(txt: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;

  for (const rawLine of txt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (field === "allow" || field === "disallow") {
      if (!current) {
        current = { agents: ["*"], rules: [] };
        groups.push(current);
      }
      current.rules.push({ allow: field === "allow", path: value });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

function selectRules(groups: RobotsGroup[], uaLower: string): RobotsRule[] {
  let best: { len: number; rules: RobotsRule[] } | null = null;
  let star: RobotsRule[] | null = null;
  for (const g of groups) {
    for (const a of g.agents) {
      if (a === "*") {
        star = g.rules;
      } else if (uaLower.includes(a) && (!best || a.length > best.len)) {
        best = { len: a.length, rules: g.rules };
      }
    }
  }
  return best ? best.rules : (star ?? []);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Tamanho do match da regra (>=0) ou -1 se não casa. Suporta `*` e `$`. */
function matchRule(rule: string, path: string): number {
  if (rule === "") return -1; // "Disallow:" vazio = libera tudo (não casa)
  const anchored = rule.endsWith("$");
  const pattern = anchored ? rule.slice(0, -1) : rule;

  if (pattern.includes("*")) {
    const re = new RegExp(
      "^" + pattern.split("*").map(escapeRegExp).join("[^]*") + (anchored ? "$" : ""),
    );
    return re.test(path) ? pattern.length : -1;
  }
  if (anchored) return path === pattern ? pattern.length : -1;
  return path.startsWith(pattern) ? pattern.length : -1;
}

export function isPathAllowed(
  robotsTxt: string,
  path: string,
  userAgent: string,
): boolean {
  const rules = selectRules(parseGroups(robotsTxt), userAgent.toLowerCase());
  let allowLen = -1;
  let disallowLen = -1;
  for (const r of rules) {
    const len = matchRule(r.path, path);
    if (len < 0) continue;
    if (r.allow) allowLen = Math.max(allowLen, len);
    else disallowLen = Math.max(disallowLen, len);
  }
  if (disallowLen < 0) return true;
  return allowLen >= disallowLen; // empate vai para Allow
}

export async function isAllowedByRobots(
  target: URL,
  userAgent: string,
): Promise<boolean> {
  const robotsUrl = `${target.protocol}//${target.host}/robots.txt`;
  try {
    const res = await fetch(robotsUrl, {
      headers: { "user-agent": userAgent },
      redirect: "follow",
    });
    if (!res.ok) return true; // sem robots.txt → permitido
    const txt = await res.text();
    return isPathAllowed(txt, target.pathname, userAgent);
  } catch {
    return true; // falha ao buscar robots → não bloqueia
  }
}
