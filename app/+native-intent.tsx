import { normalizeTTFLLink } from "@/lib/deep-links";

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    return normalizeTTFLLink(path) ?? "/";
  } catch {
    return "/";
  }
}
