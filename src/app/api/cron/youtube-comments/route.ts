import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for processing multiple accounts

export async function GET(request: Request): Promise<NextResponse> {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Running YouTube comments cron job...");

    // Find all YouTube accounts with automation enabled
    const enabledConfigs = await db.youTubeConfiguration.findMany({
      where: { enabled: true },
      include: {
        account: {
          include: {
            youtubeCredentials: true,
          },
        },
      },
    });

    console.log(`Found ${enabledConfigs.length} enabled YouTube accounts`);

    const results: Array<{
      accountId: string;
      success: boolean;
      message: string;
    }> = [];

    // Process each enabled account
    for (const config of enabledConfigs) {
      const accountId = config.accountId;

      // Check if the account has valid credentials
      const credentials = config.account.youtubeCredentials;
      if (!credentials?.accessToken || !credentials?.channelId) {
        console.log(`Skipping account ${accountId}: Missing credentials`);
        results.push({
          accountId,
          success: false,
          message: "Missing YouTube credentials",
        });
        continue;
      }

      // Check schedule - determine if we should run based on schedule setting
      const shouldRun = checkSchedule(config.schedule);
      if (!shouldRun) {
        console.log(
          `Skipping account ${accountId}: Schedule not due (${config.schedule})`
        );
        continue;
      }

      try {
        // Call the run endpoint internally
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXTAUTH_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/youtube/run`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountId }),
        });

        const data = await response.json();

        if (response.ok) {
          results.push({
            accountId,
            success: true,
            message: data.replied
              ? `Replied to ${data.repliedTo}`
              : data.message || "No action needed",
          });
        } else {
          results.push({
            accountId,
            success: false,
            message: data.error || "Unknown error",
          });
        }
      } catch (error) {
        console.error(`Error processing account ${accountId}:`, error);
        results.push({
          accountId,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "YouTube comments cron completed",
      timestamp: new Date().toISOString(),
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("YouTube comments cron error:", error);
    return NextResponse.json(
      { error: "Failed to process YouTube comments" },
      { status: 500 }
    );
  }
}

/**
 * Check if the current time matches the schedule
 * This cron runs every 5 minutes, so we check if the current schedule interval matches
 */
function checkSchedule(schedule: string): boolean {
  const now = new Date();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  switch (schedule) {
    case "every_5_min":
      // Always run (cron runs every 5 min)
      return true;
    case "every_10_min":
      // Run on 0, 10, 20, 30, 40, 50
      return minutes % 10 === 0;
    case "every_30_min":
      // Run on 0, 30
      return minutes === 0 || minutes === 30;
    case "every_hour":
      // Run on the hour
      return minutes === 0;
    case "every_3_hours":
      // Run every 3 hours at the top of the hour
      return minutes === 0 && hours % 3 === 0;
    case "every_6_hours":
      // Run every 6 hours at the top of the hour
      return minutes === 0 && hours % 6 === 0;
    default:
      // Default to every hour
      return minutes === 0;
  }
}
