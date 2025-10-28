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

    // Fetch ALL GitHub issues with pagination
    let allIssues: any[] = [];
    let issuesContext = "";
    
    try {
      let page = 1;
      const perPage = 100;
      let hasMore = true;
      
      // Fetch all issues (max 500 to avoid timeout)
      while (hasMore && allIssues.length < 500) {
        const issuesResponse = await fetch(
          `https://api.github.com/repos/${repository.full_name}/issues?state=open&per_page=${perPage}&page=${page}&sort=created&direction=desc`,
          {
            headers: {
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "Lovable-Repository-Analyzer"
            }
          }
        );

        if (issuesResponse.ok) {
          const issues = await issuesResponse.json();
          const filteredIssues = issues.filter((issue: any) => !issue.pull_request);
          allIssues = [...allIssues, ...filteredIssues];
          
          if (issues.length < perPage) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      if (allIssues.length > 0) {
        issuesContext = `\n\nTotal Open Issues: ${allIssues.length}\n\nIssue Details:\n` + 
          allIssues.slice(0, 50).map((issue: any, idx: number) => `
${idx + 1}. #${issue.number}: ${issue.title}
   Author: ${issue.user?.login}
   Created: ${issue.created_at}
   Comments: ${issue.comments}
   Labels: ${issue.labels?.map((l: any) => l.name).join(", ") || "None"}
   Body: ${issue.body?.substring(0, 200) || "No description"}${issue.body?.length > 200 ? "..." : ""}
`).join("\n");
      } else {
        issuesContext = "\n\nNo open issues found in this repository.";
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
      : `You are an advanced GitHub repository analyst and technical documentation expert. Analyze ALL the issues comprehensively and provide:

## 📊 Issue Overview
- Total count and overall health assessment
- Distribution across categories (bugs 🐛, features ✨, documentation 📚, performance ⚡, security 🔒)

## 🎯 Priority Matrix
Categorize issues into:
- 🔴 CRITICAL: Security, data loss, major bugs (list top 3-5)
- 🟠 HIGH: Significant features, important bugs (list top 3-5)
- 🟡 MEDIUM: Enhancements, minor bugs (count)
- 🟢 LOW: Nice-to-have, cleanup (count)

## 🔍 Pattern Analysis
- Common themes and recurring problems
- Technical debt indicators
- User pain points

## 💡 Actionable Recommendations
- Top 5 issues to tackle first (with issue numbers)
- Suggested approach for each priority issue
- Quick wins that could improve project health

## 📈 Health Score
Give a health score (0-100) based on:
- Issue age and resolution rate
- Critical issue count
- Community engagement (comments, activity)

Format output with clear sections, emojis, and be specific with issue numbers for actionability.`;

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
