import { NextRequest, NextResponse } from "next/server";

const RELAYER_URL = "https://relayer.testnet.zama.org";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${RELAYER_URL}/v1/user-decrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Relayer error: ${response.status} - ${responseText}` },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Decryption failed" },
      { status: 500 }
    );
  }
}

