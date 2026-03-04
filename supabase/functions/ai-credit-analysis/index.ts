import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an AI credit risk engine for MoonCreditFi, an AI-powered microcredit and on-chain credit profiling platform.

Your task is to analyze a user's on-chain wallet activity and generate a transparent, explainable credit profile that can be used to determine loan eligibility for underbanked or credit-invisible users.

PROCESS:
1. Evaluate the wallet behavior using AI reasoning, not just static rules.
2. Assign a CREDIT SCORE between 0–100.
3. Classify the user into a RISK LEVEL: Low Risk, Medium Risk, or High Risk
4. Recommend a MAXIMUM LOAN AMOUNT (microloan-focused, in USD).
5. Decide LOAN ELIGIBILITY (Eligible / Not Eligible).
6. Generate a short, human-readable explanation in simple, non-technical language.

RULES:
- Be conservative but fair.
- Assume users may not have traditional credit history.
- Prioritize consistency and behavior over raw wealth.
- Avoid technical jargon.
- Make decisions feel trustworthy and explainable.
- For wallet age < 1 month, be more conservative.
- For consistent activity, reward with higher scores.
- For DeFi interactions, consider as positive signal.
- For risk flags, penalize appropriately.

OUTPUT FORMAT (STRICT JSON):
{
  "credit_score": number (0-100),
  "risk_level": "Low" | "Medium" | "High",
  "loan_eligibility": "Eligible" | "Not Eligible",
  "recommended_loan_amount_usd": number,
  "explanation": "clear, friendly explanation",
  "ai_reasoning_summary": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, just pure JSON.`;

function buildFallbackAnalysis(walletData: any) {
  const {
    walletAge = 0,
    transactionFrequency = "low",
    transactionCount = 0,
    totalVolume = 0,
    defiInteractions = false,
    repaidLoans = 0,
    totalLoans = 0,
    onTimeRate = 0,
    activityConsistency = "low",
    riskFlags = [],
  } = walletData || {};

  let score = 50;

  // Wallet age
  if (walletAge < 1) score -= 15;
  else if (walletAge >= 6) score += 10;

  // Activity / volume
  if (transactionCount > 50 || totalVolume > 5000) score += 10;
  if (transactionCount < 5 && totalVolume < 200) score -= 10;

  // DeFi usage
  if (defiInteractions) score += 5;

  // Repayment behavior
  if (totalLoans > 0) {
    const repaymentRatio = repaidLoans / totalLoans;
    if (repaymentRatio >= 0.9) score += 15;
    else if (repaymentRatio >= 0.5) score += 5;
    else score -= 20;
  }

  // On‑time rate
  if (onTimeRate >= 95) score += 10;
  else if (onTimeRate >= 80) score += 5;
  else if (onTimeRate > 0) score -= 10;

  // Risk flags
  if (Array.isArray(riskFlags) && riskFlags.length > 0) {
    score -= 10 + riskFlags.length * 5;
  }

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  let risk_level: "Low" | "Medium" | "High" = "Medium";
  if (score >= 75) risk_level = "Low";
  else if (score <= 40) risk_level = "High";

  const loan_eligibility: "Eligible" | "Not Eligible" =
    score >= 45 && risk_level !== "High" ? "Eligible" : "Not Eligible";

  let recommended_loan_amount_usd = 50;
  if (loan_eligibility === "Eligible") {
    if (score >= 80) recommended_loan_amount_usd = 500;
    else if (score >= 65) recommended_loan_amount_usd = 250;
    else if (score >= 50) recommended_loan_amount_usd = 100;
  } else {
    recommended_loan_amount_usd = 25;
  }

  const explanation =
    loan_eligibility === "Eligible"
      ? "Based on your wallet history, you show generally responsible on‑chain behavior, so you qualify for a small starter loan."
      : "Your wallet history is still limited or shows some risk, so we recommend starting with very small amounts while you build a stronger track record.";

  const ai_reasoning_summary = [
    `Wallet age: ${walletAge} month(s), activity: ${transactionFrequency}, total tx: ${transactionCount}.`,
    `Repayment behavior and on‑time rate were factored into the score along with DeFi usage and any risk flags.`,
    `Score and risk level are calibrated for conservative, micro‑loan friendly limits.`,
  ];

  return {
    credit_score: score,
    risk_level,
    loan_eligibility,
    recommended_loan_amount_usd,
    explanation,
    ai_reasoning_summary,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const rawBody = await req.text();
    if (!rawBody?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Request body is required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { walletData } = parsedBody;
    if (!walletData || typeof walletData !== 'object' || !walletData.walletAddress) {
      return new Response(
        JSON.stringify({ error: 'walletData with walletAddress is required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('Received wallet data for analysis:', walletData);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY is not configured, using fallback scoring logic.");
      const fallback = buildFallbackAnalysis(walletData);
      return new Response(JSON.stringify({ analysis: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format wallet data for the AI
    const userPrompt = `Analyze the following on-chain wallet data and provide a credit risk assessment:

WALLET DATA:
- Wallet Address: ${walletData.walletAddress}
- Transaction Frequency: ${walletData.transactionFrequency} (${walletData.transactionCount || 0} transactions)
- Wallet Age: ${walletData.walletAge} months
- Total Transaction Volume: $${walletData.totalVolume?.toLocaleString() || '0'} USD equivalent
- DeFi Interactions: ${walletData.defiInteractions ? 'Yes' : 'No'}
- Repayment History: ${walletData.repaidLoans || 0} loans repaid out of ${walletData.totalLoans || 0} total
- On-Time Payment Rate: ${walletData.onTimeRate || 0}%
- Account Activity Consistency: ${walletData.activityConsistency}
- Risk Flags: ${walletData.riskFlags?.length > 0 ? walletData.riskFlags.join(', ') : 'None detected'}
- Current Credit Score (on-chain): ${walletData.currentCreditScore || 'Not established'}
- Total Borrowed: $${walletData.totalBorrowed?.toLocaleString() || '0'}
- Total Repaid: $${walletData.totalRepaid?.toLocaleString() || '0'}

Provide your comprehensive credit risk assessment.`;

    console.log('Sending request to AI gateway...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits depleted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiContent = data.choices?.[0]?.message?.content;
    if (!aiContent) {
      console.warn("No content in AI response, using fallback scoring logic.");
      const fallback = buildFallbackAnalysis(walletData);
      return new Response(JSON.stringify({ analysis: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON response from AI
    let creditAnalysis;
    try {
      // Clean the response - remove any markdown formatting if present
      const cleanedContent = aiContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      creditAnalysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response, using fallback instead. Raw content:", aiContent);
      const fallback = buildFallbackAnalysis(walletData);
      return new Response(JSON.stringify({ analysis: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Credit analysis complete:', creditAnalysis);

    return new Response(JSON.stringify({ analysis: creditAnalysis, source: "ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Credit analysis error, falling back to local scoring:", error);
    try {
      const url = new URL(req.url);
      const walletParam = url.searchParams.get("walletData");
      const walletData = walletParam ? JSON.parse(walletParam) : null;
      if (walletData) {
        const fallback = buildFallbackAnalysis(walletData);
        return new Response(JSON.stringify({ analysis: fallback, source: "fallback" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      // ignore secondary failures, will return generic error below
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
