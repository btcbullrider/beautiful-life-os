export async function POST(req) {
    const { system, messages } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system,
            messages,
        }),
    });

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("\n") || "No response.";

    return Response.json({ content: text });
}
