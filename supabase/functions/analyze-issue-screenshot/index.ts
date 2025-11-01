import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, repositoryName } = await req.json();
    console.log('Analyzing issue screenshot for repository:', repositoryName);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Use Gemini's vision model to analyze the screenshot
    const systemPrompt = `You are an expert software engineer and technical problem solver. 
Analyze the GitHub issue screenshot provided and generate a comprehensive solution.

Your response should include:

## 🔍 Issue Summary
- Brief description of the problem shown in the screenshot
- Affected components/modules
- Severity level (Critical/High/Medium/Low)

## 🎯 Root Cause Analysis
- What is causing this issue?
- Technical context and dependencies
- Related code areas

## ✅ Recommended Solution
- Step-by-step solution approach
- Code examples or pseudocode where applicable
- Configuration changes needed

## 🛠️ Implementation Steps
1. Specific actionable steps to fix the issue
2. Testing recommendations
3. Potential side effects to watch for

## 📚 Additional Resources
- Related documentation
- Similar issues or patterns
- Best practices to prevent recurrence

Be specific, actionable, and technical. Format with clear markdown sections.`;

    console.log('Sending vision request to AI');
    
    // Retry logic
    let lastError: Error | null = null;
    let analysis: string | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI vision request attempt ${attempt} of ${maxRetries}`);
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this GitHub issue screenshot from repository: ${repositoryName}. Provide a detailed solution.`
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64
                    }
                  }
                ]
              }
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "Payment required, please add credits to your workspace." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const errorText = await response.text();
          console.error(`AI gateway error on attempt ${attempt}:`, response.status, errorText);
          throw new Error(`AI gateway returned status ${response.status}`);
        }

        const responseText = await response.text();
        
        if (!responseText || responseText.trim() === '') {
          throw new Error("Empty response from AI gateway");
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`JSON parse error on attempt ${attempt}:`, parseError);
          throw new Error("Invalid JSON response from AI gateway");
        }

        analysis = data.choices?.[0]?.message?.content;
        
        if (!analysis) {
          throw new Error("No analysis content in response");
        }

        console.log(`AI vision request succeeded on attempt ${attempt}`);
        break;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-issue-screenshot:", error);
    
    let errorMessage = "Failed to analyze screenshot";
    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        errorMessage = "Received incomplete response from AI. Please try again.";
      } else if (error.message.includes("gateway")) {
        errorMessage = "AI service temporarily unavailable. Please try again in a moment.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
