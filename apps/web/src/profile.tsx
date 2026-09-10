"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// ponytail: one profile object (score/combo/group/region/strategy) shared by
// onboarding, lookup and suggestions via localStorage + URL params. No backend yet.
export type Profile = {
  score: string;
  combo: string;
  group: string;
  region: string;
  strategy: string;
  followed: string[];
};

const DEFAULTS: Profile = {
  score: "26.85",
  combo: "A00",
  group: "Kỹ thuật - Công nghệ",
  region: "Hà Nội",
  strategy: "balanced",
  followed: [],
};

const KEY = "compass-profile";

function load(): Profile {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<Profile>;
    return {
      score: typeof p.score === "string" ? p.score : DEFAULTS.score,
      combo: typeof p.combo === "string" ? p.combo : DEFAULTS.combo,
      group: typeof p.group === "string" ? p.group : DEFAULTS.group,
      region: typeof p.region === "string" ? p.region : DEFAULTS.region,
      strategy: typeof p.strategy === "string" ? p.strategy : DEFAULTS.strategy,
      followed: Array.isArray(p.followed) ? p.followed.filter((c) => typeof c === "string") : [],
    };
  } catch {
    return DEFAULTS;
  }
}

const Ctx = createContext<{ profile: Profile; setProfile: (p: Partial<Profile>) => void }>({
  profile: DEFAULTS,
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, set] = useState<Profile>(load);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {
      /* private mode: stay session-local */
    }
  }, [profile]);
  const value = useMemo(
    () => ({ profile, setProfile: (p: Partial<Profile>) => set((cur) => ({ ...cur, ...p })) }),
    [profile],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile() {
  return useContext(Ctx);
}
