import { NextRequest, NextResponse } from "next/server";

const ZAMA_RELAYER_URL = "https://relayer.testnet.zama.org";

/**
 * Wildcard proxy for all Zama Relayer endpoints
 * Handles: /v1/user-decrypt, /v1/public-decrypt, /v1/input-proof, etc.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const relayerPath = "/" + path.join("/");
    const targetUrl = `${ZAMA_RELAYER_URL}${relayerPath}`;

    const body = await request.json();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[Relayer Proxy] ${relayerPath} failed:`, response.status, responseText);
      return NextResponse.json(
        { error: `Relayer error: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("[Relayer Proxy] Error:", error);
    return NextResponse.json(
      { error: error.message || "Proxy request failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const relayerPath = "/" + path.join("/");
    const targetUrl = `${ZAMA_RELAYER_URL}${relayerPath}`;

    const response = await fetch(targetUrl);
    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Relayer error: ${response.status}` },
        { status: response.status }
      );
    }

    try {
      return NextResponse.json(JSON.parse(responseText));
    } catch {
      return new NextResponse(responseText, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Proxy request failed" },
      { status: 500 }
    );
  }
}

