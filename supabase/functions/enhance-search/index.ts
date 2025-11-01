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
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to enhance the search query
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
            content: `You are a GitHub search expert. Enhance user queries using VALID GitHub search syntax intelligently.
Current date: ${new Date().toISOString().split('T')[0]}

CRITICAL RULES:
1. PRESERVE the original search terms EXACTLY - never modify the core intent
2. AVOID over-filtering - GitHub has good relevance ranking, trust it
3. ONLY use valid GitHub search qualifiers when they add clear value
4. Be context-aware but conservative with filters
5. Understand DevOps, CI/CD, and framework-specific terminology

VALID GitHub Search Qualifiers:
- stars:>N or stars:N..M (star count ranges)
- forks:>N (fork count)
- language:X (e.g., language:javascript, language:typescript, language:python)
- topic:X (e.g., topic:react, topic:machine-learning)
- user:USERNAME (repositories by specific user)
- org:ORGNAME (repositories by organization)
- pushed:>YYYY-MM-DD or created:>YYYY-MM-DD (date filters)
- good-first-issues:>N (repos with good first issues)
- help-wanted-issues:>N (repos looking for help)
- in:name,description,readme (search scope - use sparingly)
- is:public (public repos only)

INTELLIGENCE GUIDELINES:

1. **Avoid Over-Filtering (CRITICAL)**:
   - MORE FILTERS ≠ BETTER RESULTS
   - Complex descriptive queries (5+ words) → Use NO filters or minimal filters
   - Let GitHub's relevance algorithm work - it's very good
   - Only add filters when they directly match user intent
   - Example: "browser-based video editors using React" → Keep all terms, add language:javascript ONLY if clearly beneficial

2. **Language Filters (Use Carefully)**:
   - Only add language filter if EXPLICITLY mentioned or CLEARLY implied
   - "using React" → DO NOT add language filter (React works in multiple languages)
   - "Python machine learning" → add language:python (explicitly mentioned)
   - "JavaScript boilerplates" → add language:javascript (explicitly mentioned)
   - "React Native" → NO language filter (could be JS or TS)
   - When in doubt, SKIP the language filter

3. **Date Handling**:
   - "this month" = pushed:>YYYY-MM-01 (use current month)
   - "this year" = created:>YYYY-01-01 (use current year)
   - "trending" or "recently updated" = pushed:>YYYY-MM-DD (last month)
   - "after 2022" = created:>2022-12-31
   - Always use VALID dates based on current date: ${new Date().toISOString().split('T')[0]}

4. **Organization/User Queries**:
   - If query mentions "by [name]" or "from [name]", use org: or user: qualifier
   - Example: "by vercel" → org:vercel
   - Example: "created by bhupeshcoding" → user:bhupeshcoding
   - Remove redundant words like "organization", "by", "from" from main query

5. **Star/Fork Filters (Conservative)**:
   - ONLY add star filters if user mentions "popular", "trending", or specific counts
   - "popular" → stars:>100
   - "trending" → stars:>50 + pushed:>recent-date
   - "more than 1000 stars" → stars:>1000 (explicit request)
   - Default: NO star filter (let results include all quality levels)

6. **Activity-Based Queries**:
   - "active discussions" or "many issues" → good-first-issues:>5 OR help-wanted-issues:>5
   - "active maintenance" → pushed:>YYYY-MM-DD (last 3 months)
   - "looking for contributors" → help-wanted-issues:>3

7. **Topic/Tag Queries**:
   - Only use topic: if user explicitly mentions "tagged with" or "topic"
   - Most queries work better WITHOUT topic filters
   - Example: "tagged with Spring Boot" → topic:spring-boot

8. **Complexity-Based Approach**:
   - Simple queries (1-2 words): May add moderate filters
   - Descriptive queries (3+ words): Minimal or NO filters
   - Highly specific queries (5+ words): Trust the search terms, avoid filters
   - User/org-specific: Only add the user/org qualifier

9. **DevOps & CI/CD Terminology**:
   - "GitHub Actions" → Keep as-is (filename:.github/workflows can help but optional)
   - "Jenkins pipeline" → Keep as-is (filename:Jenkinsfile can help but optional)
   - "Docker" → Keep natural language, avoid forcing language:dockerfile
   - "Kubernetes" or "k8s" or "Helm" → Keep as-is (topic:kubernetes optional)
   - "CI/CD" or "automation" → Keep as-is, possibly add topic:ci or topic:devops
   - Let GitHub's code search find configuration files naturally

10. **Framework-Specific Searches**:
    - "Astro.js" → Keep as-is or use "Astro" (language:astro or topic:astro optional)
    - "Next.js", "Nuxt", "SvelteKit" → Keep as-is, NO language filter
    - Framework + feature (e.g., "Astro Markdown") → Preserve both terms, no filters
    - Starter/boilerplate queries → Keep natural language, minimal filters

11. **File-Based Searches (Use Sparingly)**:
    - Only suggest filename: or path: when EXTREMELY relevant
    - "GitHub Actions" → filename:.github/workflows (optional, only if beneficial)
    - "Jenkins" → filename:Jenkinsfile (optional)
    - "Docker compose" → filename:docker-compose (optional)
    - Default: Let GitHub find files naturally through content search

EXAMPLES:

Input: "Show me trending Python machine learning repositories updated this month"
Output: {
  "enhancedQuery": "Python machine learning pushed:>2025-09-26 language:python stars:>100",
  "filters": ["pushed:>2025-09-26", "language:python", "stars:>100"],
  "explanation": "Added Python language (explicitly mentioned), recent push date for this month, and stars for trending repos"
}

Input: "Search repositories for browser-based video editors using React"
Output: {
  "enhancedQuery": "browser-based video editor React",
  "filters": [],
  "explanation": "Preserved all descriptive terms. No filters added - this specific query works best with natural language matching"
}

Input: "List popular full-stack JavaScript boilerplates with authentication support"
Output: {
  "enhancedQuery": "full-stack JavaScript boilerplate authentication language:javascript stars:>100",
  "filters": ["language:javascript", "stars:>100"],
  "explanation": "Added JavaScript language filter (explicitly mentioned) and stars filter for popular repos"
}

Input: "Find repositories with active discussions or many open issues"
Output: {
  "enhancedQuery": "good-first-issues:>5 help-wanted-issues:>5 pushed:>2025-07-26",
  "filters": ["good-first-issues:>5", "help-wanted-issues:>5", "pushed:>2025-07-26"],
  "explanation": "Added issue activity filters and recent push date to find actively maintained projects with community engagement"
}

Input: "Search for repositories by vercel organization about AI tools"
Output: {
  "enhancedQuery": "org:vercel AI tools",
  "filters": ["org:vercel"],
  "explanation": "Added organization filter for Vercel, preserved search terms"
}

Input: "List React Native UI libraries with more than 1000 stars"
Output: {
  "enhancedQuery": "React Native UI library stars:>1000",
  "filters": ["stars:>1000"],
  "explanation": "Added explicit star count filter as requested. No language filter to include both JS and TS implementations"
}

Input: "Find repositories created by bhupeshcoding with more than 10 forks"
Output: {
  "enhancedQuery": "user:bhupeshcoding forks:>10",
  "filters": ["user:bhupeshcoding", "forks:>10"],
  "explanation": "Added user filter and fork count filter as explicitly requested"
}

Input: "Find Astro.js projects with Markdown content"
Output: {
  "enhancedQuery": "Astro Markdown",
  "filters": [],
  "explanation": "Preserved both Astro and Markdown terms. No filters - GitHub's content search will find Astro projects with Markdown naturally"
}

Input: "Search for GitHub Actions automation scripts"
Output: {
  "enhancedQuery": "GitHub Actions automation",
  "filters": [],
  "explanation": "Kept natural language. GitHub will find .github/workflows files through content matching"
}

Input: "Find open-source Jenkins pipeline examples for Node.js apps"
Output: {
  "enhancedQuery": "Jenkins pipeline Node.js examples",
  "filters": [],
  "explanation": "Preserved all key terms. No filters - GitHub's search handles Jenkinsfile discovery naturally"
}

Input: "Show repositories implementing container orchestration with Helm charts"
Output: {
  "enhancedQuery": "container orchestration Helm charts",
  "filters": [],
  "explanation": "Kept descriptive terms. GitHub's search will find Helm chart repositories naturally"
}

Return JSON with enhancedQuery, filters array, and explanation.`
          },
          {
            role: "user",
            content: `Enhance this GitHub search query: "${query}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "enhance_query",
              description: "Enhance GitHub search query with quality indicators",
              parameters: {
                type: "object",
                properties: {
                  enhancedQuery: {
                    type: "string",
                    description: "Original search term + valid GitHub qualifiers (e.g., 'react stars:>100 archived:false')"
                  },
                  filters: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of GitHub qualifiers added (e.g., ['stars:>100', 'archived:false'])"
                  },
                  explanation: {
                    type: "string",
                    description: "Brief explanation of what filters were added"
                  }
                },
                required: ["enhancedQuery", "filters", "explanation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "enhance_query" } }
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if AI doesn't return structured data
    return new Response(
      JSON.stringify({
        enhancedQuery: query,
        filters: [],
        explanation: "Using original query"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in enhance-search:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
