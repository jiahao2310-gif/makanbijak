import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const DOMAIN = "makanbijak.app";

function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${DOMAIN}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, fullName } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const email = usernameToEmail(username);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username.trim().toLowerCase(),
        full_name: fullName || null,
      },
    });

    if (error) throw error;

    return NextResponse.json({ user: data.user });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
