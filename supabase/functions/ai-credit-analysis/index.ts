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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { walletData } = await req.json();
    
    console.log('Received wallet data for analysis:', walletData);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
      throw new Error("No content in AI response");
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
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("AI returned invalid JSON format");
    }

    console.log('Credit analysis complete:', creditAnalysis);

    return new Response(JSON.stringify({ analysis: creditAnalysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Credit analysis error:", error);
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
