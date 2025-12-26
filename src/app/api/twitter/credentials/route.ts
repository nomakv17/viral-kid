import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    const credentials = await db.twitterCredentials.findUnique({
      where: { accountId },
    });

    if (!credentials) {
      return NextResponse.json(
        { error: "Credentials not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: credentials.id,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret ? "••••••••" : "",
      rapidApiKey: credentials.rapidApiKey ? "••••••••" : "",
      username: credentials.username,
      isConnected: !!credentials.accessToken,
    });
  } catch (error) {
    console.error("Failed to fetch Twitter credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { clientId, clientSecret, rapidApiKey } = body;

    const updateData: Record<string, string> = {};

    if (clientId !== undefined) updateData.clientId = clientId;
    if (clientSecret && clientSecret !== "••••••••")
      updateData.clientSecret = clientSecret;
    if (rapidApiKey && rapidApiKey !== "••••••••")
      updateData.rapidApiKey = rapidApiKey;

    const credentials = await db.twitterCredentials.update({
      where: { accountId },
      data: updateData,
    });

    return NextResponse.json({
      id: credentials.id,
      clientId: credentials.clientId,
      username: credentials.username,
      isConnected: !!credentials.accessToken,
    });
  } catch (error) {
    console.error("Failed to save Twitter credentials:", error);
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 }
    );
  }
}
