

// app/api/create-payment/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use the exact same env variable name as in your Deno function
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure this matches your .env
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming request body:", body);

    const { contestantId, votes, phone, name } = body;

    if (!contestantId || !votes) {
      return NextResponse.json({ error: "Missing required fields: contestantId or votes" }, { status: 400 });
    }

    // Call the Supabase Edge Function
    const result = await supabase.functions.invoke('create-payment', {
      body: JSON.stringify({ contestantId, votes, phone, name }),
    });

    console.log("Edge function result:", result);

    if (result.error) {
  let errorText = '';
  if (result.response) {
    try {
      errorText = await result.response.text();
    } catch (e) {
      console.error("Error reading response text:", e);
    }
  }
  console.error("Edge function returned error:", result.error, "Body:", errorText);
  return NextResponse.json({ error: result.error, details: errorText }, { status: 502 });
}

    // Success
    const responseData = result.data;
    console.log("Payment link response data:", responseData);

    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
