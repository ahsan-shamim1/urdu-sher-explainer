import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "Warning: ANTHROPIC_API_KEY is not set. Requests to /api/explain will fail. See server/.env.example."
  );
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/api/explain", async (req, res) => {
  const sher = typeof req.body?.sher === "string" ? req.body.sher.trim() : "";

  if (!sher) {
    return res.status(400).json({ error: "براہ کرم پہلے شعر درج کریں۔" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system:
        "آپ اردو شاعری کے ماہر نقاد ہیں۔ صارف ایک شعر (اردو رسم الخط یا رومن اردو میں) دے گا۔ اس شعر کی وضاحت خالص اردو زبان میں دیں اور جواب کو تین حصوں میں تقسیم کریں، ہر حصے کے لیے یہ عنوانات استعمال کریں:\n\n1. لفظی معنی\n2. شعری و استعاراتی معنی\n3. جذباتی کیفیت\n\nجواب واضح، رواں اور خوبصورت اردو نثر میں ہونا چاہیے۔",
      messages: [{ role: "user", content: sher }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ explanation: text });
  } catch (error) {
    console.error("Anthropic API error:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "سرور میں API کی چابی درست نہیں ہے۔" });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "درخواستیں زیادہ ہو گئی ہیں، براہ کرم تھوڑی دیر بعد کوشش کریں۔" });
    }
    if (error instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "وضاحت حاصل کرنے میں مسئلہ پیش آیا، دوبارہ کوشش کریں۔" });
    }

    res.status(500).json({ error: "ایک نامعلوم خرابی پیش آئی۔" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
