import { NextResponse } from "next/server";
import { createServerDatabaseService } from "@/lib/supabase/service";

export async function GET() {
  try {
    const db = await createServerDatabaseService();
    const result = await db.findMany("user_profiles");

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
