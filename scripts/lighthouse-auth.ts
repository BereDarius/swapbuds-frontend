#!/usr/bin/env tsx

/**
 * Lighthouse Authentication Script
 *
 * Authenticates test users and stores tokens in .lighthouseci/ directory
 * for use by lighthouse-runner.mjs
 *
 * Usage:
 *   npx tsx scripts/lighthouse-auth.ts user
 *   npx tsx scripts/lighthouse-auth.ts admin
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

const TEST_USERS = {
  user: {
    email: "lighthouse.user@test.com",
    password: "LighthouseTest123!",
  },
  admin: {
    email: "lighthouse.admin@test.com",
    password: "LighthouseTest123!",
  },
};

async function authenticate(userType: "user" | "admin"): Promise<void> {
  const credentials = TEST_USERS[userType];

  console.log(`🔐 Authenticating ${userType}: ${credentials.email}`);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Authentication failed: ${response.status} ${error}`);
    }

    const data: AuthResponse = await response.json();

    // Ensure .lighthouseci directory exists
    const lighthouseDir = join(process.cwd(), ".lighthouseci");
    await mkdir(lighthouseDir, { recursive: true });

    // Save tokens to file
    const tokenFile = join(lighthouseDir, `${userType}-token.txt`);
    await writeFile(tokenFile, data.accessToken, "utf-8");

    console.log(`✅ ${userType} authenticated (${data.user.username})`);
    console.log(`   Token saved to: ${tokenFile}`);
  } catch (error) {
    console.error(`❌ Failed to authenticate ${userType}:`, error);
    process.exit(1);
  }
}

// Main
const userType = process.argv[2] as "user" | "admin";

if (!userType || !["user", "admin"].includes(userType)) {
  console.error("Usage: npx tsx lighthouse-auth.ts [user|admin]");
  process.exit(1);
}

authenticate(userType);
