import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { ChatRequestSchema } from "@/lib/security/schemas";
import { checkRateLimit, extractClientIp, generateCorrelationId } from "@/lib/security/rateLimit";
import { sanitizeDeep, detectPromptInjection } from "@/lib/security/sanitizer";
import { UTSAV_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getAiMode } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  const correlationId = generateCorrelationId();
  const clientIp = extractClientIp(req.headers);

  // Rate Limiting
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down.", correlationId },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSec || 1) } },
    );
  }

  try {
    const rawBody = await req.json();
    const sanitizedBody = sanitizeDeep(rawBody);

    const injection = detectPromptInjection(sanitizedBody.message || "");
    if (injection.isSuspicious) {
      return NextResponse.json(
        { error: "Prohibited query pattern detected.", correlationId },
        { status: 400 },
      );
    }

    const validated = ChatRequestSchema.safeParse(sanitizedBody);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid message payload.", correlationId },
        { status: 400 },
      );
    }

    const { message, context } = validated.data;
    const mode = getAiMode();

    // Prepare context prompt
    const contextPrompt = context
      ? `EVENT CONTEXT:
- Name: ${context.eventName || "Not specified"}
- Type: ${context.eventType || "Not specified"}
- City: ${context.city || "Not specified"}
- Budget: ₹${(context.totalBudget || 0).toLocaleString("en-IN")}
- Guests: ${context.guestCount || "Not specified"}
- Vibes: ${context.vibe?.join(", ") || "Festive"}

USER QUERY:
${message}
`
      : `USER QUERY: ${message}`;

    const encoder = new TextEncoder();

    // If Live AI is available
    if (mode.mode === "live") {
      try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (geminiKey) {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
          const responseStream = await ai.models.generateContentStream({
            model,
            contents: `${UTSAV_SYSTEM_PROMPT}\n\n${contextPrompt}`,
          });

          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of responseStream) {
                  if (chunk.text) {
                    controller.enqueue(encoder.encode(chunk.text));
                  }
                }
                controller.close();
              } catch (err) {
                controller.error(err);
              }
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
            },
          });
        }

        if (anthropicKey) {
          const anthropic = new Anthropic({ apiKey: anthropicKey });
          const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
          const stream = await anthropic.messages.stream({
            model,
            max_tokens: 1500,
            system: UTSAV_SYSTEM_PROMPT,
            messages: [{ role: "user", content: contextPrompt }],
          });

          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const event of stream) {
                  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                    controller.enqueue(encoder.encode(event.delta.text));
                  }
                }
                controller.close();
              } catch (err) {
                controller.error(err);
              }
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
            },
          });
        }
      } catch (err) {
        console.warn("Live stream chat error, falling back to simulated stream:", err);
      }
    }

    // Demo Mode Simulated Streaming
    const demoResponse = generateDemoChatResponse(message, context);
    const readable = new ReadableStream({
      async start(controller) {
        const words = demoResponse.split(" ");
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode((i > 0 ? " " : "") + words[i]));
          await new Promise((r) => setTimeout(r, 20));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error(`[${correlationId}] Chat route error:`, error);
    return NextResponse.json({ error: "Unable to process chat request.", correlationId }, { status: 500 });
  }
}

function generateDemoChatResponse(
  query: string,
  context?: { eventName?: string; eventType?: string; city?: string },
): string {
  const lower = query.toLowerCase();

  if (lower.includes("decor") || lower.includes("budget-friendly")) {
    return `Here are 4 budget-friendly yet breathtaking decor ideas for ${context?.eventName || "your celebration"}:
1. **Marigold Cascades & Brass Urli Accents**: Source marigolds locally at dawn from the wholesale mandi. String them into vertical floor-to-ceiling backdrops with fairy lights for an opulent look at a fraction of imported floral costs.
2. **Clay Diya & Floating Candle Pathways**: Line pathways with terracotta diyas and brass bowls filled with floating rose petals.
3. **Bandhani & Chanderi Fabric Draping**: Rent vibrant regional fabrics to drape ceilings and create warm canopy effects rather than building heavy carpentry structures.
4. **Upcycled Brass Lanterns & Fairy Light Trees**: Wrap tree trunks with warm micro-LED string lights for a magical golden-hour glow.`;
  }

  if (lower.includes("surprise") || lower.includes("entry")) {
    return `Spectacular surprise concepts that create unforgettable moments:
1. **Flashmob Baraat / Grand Entrance**: Coordinate with siblings and cousins for a synchronized 90-second upbeat dance medley right as the celebration begins.
2. **Personalized Audio Keepsake**: Have grandparents and childhood friends record 10-second blessing voice notes, played softly alongside a heartwarming photo slideshow.
3. **Mid-Celebration Drone Petal Shower**: Program an aerial petal drop during the key celebratory moment or cake cutting.
4. **Secret Late-Night Street Cart**: Roll in a surprise midnight Maggi and Masala Chai stall when energy peaks!`;
  }

  if (lower.includes("rain") || lower.includes("weather") || lower.includes("backup")) {
    return `Smart weather contingency plan for ${context?.city || "your venue"}:
1. **Pandal Waterproofing Clause**: Ensure your venue contract includes clear heavy-duty transparent German hangar or pagoda tenting with rain gutters.
2. **Raised Wooden Flooring**: Cover wet lawn areas with raised wooden decking and anti-skid carpets.
3. **Designer Festive Umbrellas**: Keep 50 colorful Rajasthani embroidered umbrellas at the entrance — they protect guests from drizzle and double as vibrant photo props!
4. **Indoor Flow Plan**: Design an alternate indoor floorplan for key moments so transitions take under 10 minutes if weather shifts.`;
  }

  if (lower.includes("sangeet") || lower.includes("music") || lower.includes("dance")) {
    return `High-energy Sangeet performance curation:
1. **Era-by-Era Bollywood Medley**: Start with 70s retro classics for parents, transition to 90s nostalgia for aunts and uncles, and finish with viral chartbusters for the youngsters.
2. **Interactive Couple Roasting / Q&A Game**: A lighthearted 10-minute game hosted by the emcee (like the Shoe Game with Indian celebration trivia).
3. **Live Dhol & LED Tasha Face-off**: Bring in live Punjabi dhol players to battle against the DJ console for peak dancefloor euphoria!`;
  }

  if (lower.includes("menu") || lower.includes("food") || lower.includes("200")) {
    return `Balanced festive banquet strategy for 200 guests:
1. **Interactive Live Counters**: 3 live street counters (Pani Puri with 5 waters, Lucknowi Galouti Kebabs, and wood-fired thin-crust naan/kulcha).
2. **Comfort Regional Main Spread**: 2 rich gravies (Paneer Lababdar & Dal Makhani simmered 24 hours), 1 light seasonal vegetable, fragrant Jeera Pulao, and assorted tandoori breads.
3. **Dessert Spectacle**: Saffron Jalebi made live paired with chilled Rabdi, plus artisanal Sitaphal or Kesar Pista kulfi.`;
  }

  return `Splendid idea for ${context?.eventName || "your celebration"}! In Indian celebrations, the magic lies in thoughtful sensory details — the fragrance of fresh jasmine (mogra), warm amber illumination, and effortless hospitality. Feel free to refine your budget allocations or save this recommendation directly to your Saved Ideas board!`;
}

