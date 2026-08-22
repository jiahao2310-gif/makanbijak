"use client";

import { useState, useEffect } from "react";
import { HealthProfile } from "@/lib/types";

const STORAGE_KEY = "makanbijak_health_profile";

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
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProfile(JSON.parse(raw));
      } catch {
        setProfile(null);
      }
    }
    setLoaded(true);
  }, []);

  const saveProfile = (p: HealthProfile) => {
    p.last_updated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfile(p);
  };

  return { profile, loaded, saveProfile };
}
