"use client";

import { useState } from "react";
import { DietHabits } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  initial?: DietHabits | null;
  onSave: (h: DietHabits) => void;
}

const restrictionOptions = ["halal", "vegetarian", "no seafood", "no nuts"];
const goalOptions = [
  "lose weight",
  "control blood sugar",
  "lower cholesterol",
  "maintain",
  "gain muscle",
];

export function DietOnboarding({ initial, onSave }: Props) {
  const [h, setH] = useState<DietHabits>(initial || {
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
    budget: "RM5-10",
    restrictions: [],
    eating_out_days: 3,
    activity: "sedentary",
    goals: [],
    age: 35,
    gender: "male",
  });
  const [step, setStep] = useState(0);

  const update = <K extends keyof DietHabits>(key: K, value: DietHabits[K]) => {
    setH((prev) => ({ ...prev, [key]: value }));
  };

  const toggle = (key: "restrictions" | "goals", value: string) => {
    setH((prev) => {
      const list = new Set(prev[key]);
      if (list.has(value)) list.delete(value);
      else list.add(value);
      return { ...prev, [key]: Array.from(list) };
    });
  };

  const steps = [
    { title: "Daily Habits", description: "Tell us what you usually eat." },
    { title: "Budget & Restrictions", description: "Your budget and dietary needs." },
    { title: "Activity & Goals", description: "How active are you?" },
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-700">{steps[step].title}</h2>
        <p className="text-sm text-gray-500">{steps[step].description}</p>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label>Typical breakfast</Label>
            <Textarea
              value={h.breakfast}
              onChange={(e) => update("breakfast", e.target.value)}
              placeholder="e.g. nasi lemak from stall"
            />
          </div>
          <div>
            <Label>Typical lunch</Label>
            <Textarea
              value={h.lunch}
              onChange={(e) => update("lunch", e.target.value)}
              placeholder="e.g. nasi campur at food court"
            />
          </div>
          <div>
            <Label>Typical dinner</Label>
            <Textarea
              value={h.dinner}
              onChange={(e) => update("dinner", e.target.value)}
              placeholder="e.g. mamak 3x/week, home cook 2x"
            />
          </div>
          <div>
            <Label>Snacks / drinks</Label>
            <Textarea
              value={h.snacks}
              onChange={(e) => update("snacks", e.target.value)}
              placeholder="e.g. teh tarik every day"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Budget per meal</Label>
            <Select value={h.budget} onValueChange={(v) => update("budget", v || "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<RM5">Less than RM5</SelectItem>
                <SelectItem value="RM5-10">RM5 - RM10</SelectItem>
                <SelectItem value="RM10-15">RM10 - RM15</SelectItem>
                <SelectItem value="RM15-25">RM15 - RM25</SelectItem>
                <SelectItem value=">RM25">More than RM25</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dietary restrictions</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {restrictionOptions.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={h.restrictions.includes(r)}
                    onCheckedChange={() => toggle("restrictions", r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Eating out (days/week)</Label>
            <Input
              type="range"
              min={0}
              max={7}
              value={h.eating_out_days}
              onChange={(e) =>
                update("eating_out_days", parseInt(e.target.value))
              }
            />
            <p className="text-sm text-gray-500">{h.eating_out_days} days</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label>Activity level</Label>
            <Select value={h.activity} onValueChange={(v) => update("activity", v || "sedentary")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="lightly active">Lightly active</SelectItem>
                <SelectItem value="moderately active">Moderately active</SelectItem>
                <SelectItem value="very active">Very active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Health goals</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {goalOptions.map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={h.goals.includes(g)}
                    onCheckedChange={() => toggle("goals", g)}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={h.age || ""}
                onChange={(e) => update("age", parseInt(e.target.value) || 35)}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={h.gender} onValueChange={(v) => update("gender", (v as "male" | "female") || "male")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {step > 0 && (
          <Button variant="outline" onClick={prev} className="flex-1">
            Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={next} className="flex-1 bg-green-600 hover:bg-green-700">
            Next
          </Button>
        ) : (
          <Button onClick={() => onSave(h)} className="flex-1 bg-green-600 hover:bg-green-700">
            Save & Generate Plan
          </Button>
        )}
      </div>
    </div>
  );
}
