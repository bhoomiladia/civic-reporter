import { withErrorHandler, successResponse, authenticateRequest, AppError } from '@/server/utils';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are Civic AI, a friendly, knowledgeable, and helpful AI assistant for the Civic Reporter platform.
Your primary role is to assist citizens with municipal queries, reporting guidelines, and understanding the platform.

Keep in mind these specific details of the Civic Reporter platform:
1. **Reporting & Tracking**: Citizens can submit reports about civic issues (potholes, streetlights, graffiti, water leaks, trash, etc.) with a photo.
2. **Dual Verification System**: When an issue is reported, it does NOT immediately appear on the map. It undergoes a dual-audit verification:
   - **Civic AI Vision Audit**: Scans the uploaded photo to confirm it matches the description.
   - **Community consensus**: Requires confirmations (verification votes) by 3 nearby residents.
3. **Map Gating**: Only issues that successfully pass both checks appear on the public map pins.
4. **Lifecycle Stages**: Once verified, the issue goes to "Municipality Review", then "Assigned" (work order created), "Dispatched" (crew on the way), "Repair in progress", and finally "Resolved".
5. **Gamification**: Citizens earn Contribution Points (15 pts for reporting, 10 pts for verifying, 30 pts for a resolved report) and unlock badges.

Be professional, concise, encouraging, and format your response with clean Markdown. Do not give extremely long responses. Keep them under 3 paragraphs if possible.`;

export const POST = withErrorHandler(async (request) => {
  // Authenticate user to make sure requests are coming from valid sessions
  await authenticateRequest(request);

  const body = await request.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    throw AppError.badRequest('messages array is required');
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-10) // Limit context to last 10 messages to save tokens
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices[0].message.content;
        return successResponse({ content }, 'Success');
      } else {
        const errText = await response.text();
        console.error('[AI Chat API error response]', errText);
      }
    } catch (e) {
      console.error('[AI Chat API error]', e);
    }
  }

  // Fallback simulation engine if Groq fails or key is missing
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  let fallbackReply = "I am here to help you navigate Civic Reporter. How can I assist you with reporting or verifying community issues?";

  if (lastUserMsg.includes('pothole') || lastUserMsg.includes('how to report') || lastUserMsg.includes('file a report')) {
    fallbackReply = "To report a pothole or any other civic issue:\n1. Go to the **Report** page using the bottom nav or sidebar.\n2. Pick the location on the map.\n3. Take or upload a photo.\n4. Write a title, description, and submit. Civic AI will instantly analyze it to verify!";
  } else if (lastUserMsg.includes('verify') || lastUserMsg.includes('verification') || lastUserMsg.includes('3 people') || lastUserMsg.includes('confirm')) {
    fallbackReply = "Our platform gates issues from the map to avoid spam. To show on the map, a report needs a **Civic AI Vision Audit** (completed automatically on upload) and **3 confirmations from nearby neighbors**. Go to the issue page and click 'Verify' to confirm details!";
  } else if (lastUserMsg.includes('map') || lastUserMsg.includes('show on map') || lastUserMsg.includes('cannot see')) {
    fallbackReply = "If you reported an issue but don't see it on the map, it is likely awaiting community verification. Once **3 nearby residents** confirm the issue, it will immediately appear on the public map!";
  } else if (lastUserMsg.includes('score') || lastUserMsg.includes('points') || lastUserMsg.includes('badge') || lastUserMsg.includes('gamif')) {
    fallbackReply = "You earn points by helping the community!\n- **15 Points** for filing a new report\n- **10 Points** for verifying a neighbor's report\n- **30 Points** when your reported issue gets resolved. Check your **Profile** page to view your badges and contribution history!";
  } else if (lastUserMsg.includes('hello') || lastUserMsg.includes('hi') || lastUserMsg.includes('hey')) {
    fallbackReply = "Hello! I am your Civic AI Assistant. I can help explain reporting guidelines, map visibility rules, and how local community verification works. What's on your mind today?";
  }

  // Simulate typing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return successResponse({ content: fallbackReply }, 'Success (Simulation Mode)');
});
