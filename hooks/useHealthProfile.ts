"use client";

import { useState, useEffect } from "react";
import { HealthProfile } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";

const LOCAL_KEY = "makanbijak_health_profile";

export const emptyProfile: HealthProfile = {
  blood_glucose_fasting: null,
  hba1c: null,
  total_cholesterol: null,
  hdl: null,
  ldl: null,
  triglycerides: null,
  blood_pressure_systolic: null,
  blood_pressure_diastolic: null,
  bmi: null,
  weight_kg: null,
  height_cm: null,
  conditions: [],
  report_date: null,
  last_updated: new Date().toISOString(),
};

export function useHealthProfile() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const {
          data: { session },
        } = await getSupabase().auth.getSession();

        if (session?.user) {
          const { data, error } = await getSupabase()
            .from("health_profiles")
            .select("data")
            .eq("user_id", session.user.id)
            .single();

          if (data?.data && !error) {
            setProfile(data.data as HealthProfile);
            setLoaded(true);
            return;
          }
        }
      } catch {
        // ignore
      }

      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        try {
          setProfile(JSON.parse(raw));
        } catch {
          setProfile(null);
        }
      }
      setLoaded(true);
    };

    load();
  }, []);

  const saveProfile = async (p: HealthProfile) => {
    p.last_updated = new Date().toISOString();
    setProfile(p);

    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession();

      if (session?.user) {
        await getSupabase().from("health_profiles").upsert(
          {
            user_id: session.user.id,
            data: p,
          },
          { onConflict: "user_id" }
        );
        return;
      }
    } catch {
      // fall through to localStorage
    }

    localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
  };

  return { profile, loaded, saveProfile };
}
