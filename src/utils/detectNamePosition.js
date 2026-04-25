export async function detectNamePosition(imageBase64, imageWidth, imageHeight) {
  const GEMINI_API_KEY = "AIzaSyCtdruY-OE2wtEDxO7ZNGQNR2Ro4pxt-q4";

  const prompt = `This is a certificate template image with dimensions ${imageWidth}x${imageHeight} pixels.
Find the text "{{STUDENT_NAME}}" written somewhere on this certificate.

Analyze it carefully and return ONLY a raw JSON object with these exact fields:
{
  "x": pixel x coordinate of the CENTER of the {{STUDENT_NAME}} text,
  "y": pixel y coordinate of the CENTER of the {{STUDENT_NAME}} text,
  "color": hex color code of the {{STUDENT_NAME}} text (e.g. "#B8960C"),
  "fontSize": font size as decimal percentage of image width (e.g. 0.055),
  "fontStyle": "italic" or "normal",
  "fontWeight": "bold" or "normal",
  "fontFamily": one of: "Georgia", "Arial", "Times New Roman", "Verdana", "Trebuchet MS"
}

No markdown. No backticks. No explanation. Return only the raw JSON object.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/png",
                  data: imageBase64.split(",")[1],
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 150,
        },
      }),
    }
  );

  // ── THIS WAS THE BUG — was !res.ok which crashed every time ───────────────
  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini error:", errText);
    throw new Error("Gemini API request failed: " + errText);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) throw new Error("Gemini returned empty response");

  const cleaned = text.replace(/```json|```/g, "").trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini response:", cleaned);
    throw new Error("Could not parse Gemini response as JSON");
  }

  return {
    x:          result.x,
    y:          result.y,
    color:      result.color      || "#B8960C",
    fontSize:   result.fontSize   || 0.055,
    fontStyle:  result.fontStyle  || "italic",
    fontWeight: result.fontWeight || "normal",
    fontFamily: result.fontFamily || "Georgia",
  };
}