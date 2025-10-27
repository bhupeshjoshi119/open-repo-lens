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
    const { repository, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch real GitHub issues
    let issuesContext = "";
    try {
      const issuesResponse = await fetch(
        `https://api.github.com/repos/${repository.full_name}/issues?state=open&per_page=20&sort=created&direction=desc`,
        {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Lovable-Repository-Analyzer"
          }
        }
      );

      if (issuesResponse.ok) {
        const issues = await issuesResponse.json();
        if (issues && issues.length > 0) {
          issuesContext = "\n\nRecent Open Issues:\n" + issues
            .filter((issue: any) => !issue.pull_request)
            .slice(0, 15)
            .map((issue: any, idx: number) => `
${idx + 1}. Issue #${issue.number}: ${issue.title}
   Author: ${issue.user?.login || "Unknown"}
   Created: ${issue.created_at}
   Comments: ${issue.comments}
   Labels: ${issue.labels?.map((l: any) => l.name).join(", ") || "None"}
   Body: ${issue.body?.substring(0, 300) || "No description"}${issue.body?.length > 300 ? "..." : ""}
`).join("\n");
        } else {
          issuesContext = "\n\nNo open issues found in this repository.";
        }
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      issuesContext = "\n\nUnable to fetch issues data.";
    }

    // Construct context from repository data
    const repoContext = `
Repository: ${repository.full_name}
Description: ${repository.description || "No description"}
Language: ${repository.language || "Not specified"}
Stars: ${repository.stargazers_count}
Forks: ${repository.forks_count}
Open Issues: ${repository.open_issues_count}
Created: ${repository.created_at}
Last Updated: ${repository.updated_at}
Topics: ${repository.topics?.join(", ") || "None"}
License: ${repository.license?.name || "No license"}${issuesContext}
    `.trim();

    const systemPrompt = prompt 
      ? `You are a GitHub repository analyst with expertise in software engineering, architecture, and project management. Analyze the provided repository data and issues to answer the user's question. Focus on providing deep insights, identifying patterns, and highlighting important technical or architectural considerations.`
      : `You are a GitHub repository analyst. Provide a comprehensive summary of this repository including:
- Main purpose and functionality
- Technology stack and quality indicators
- Activity and maintenance status
- Analysis of open issues and their significance
- Strengths and potential use cases
- Any notable concerns or considerations
Be concise but insightful.`;

    const userMessage = prompt || `Analyze this repository:\n\n${repoContext}`;

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
            content: `${userMessage}\n\nRepository Data:\n${repoContext}`
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
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;
    
    if (!analysis) {
      throw new Error("No analysis generated");
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-repository:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
