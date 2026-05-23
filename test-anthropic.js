// Quick test script to check available models
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testModels() {
  const modelsToTry = [
    "claude-opus-4-7",
    "claude-sonnet-4-6",
    "claude-haiku-4-5",
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`\nTrying model: ${model}`);
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 50,
        messages: [{ role: "user", content: "Hi" }],
      });
      console.log(`✓ ${model} works!`);
      console.log(`Response: ${response.content[0].text.substring(0, 50)}...`);
    } catch (error) {
      console.log(`✗ ${model} failed: ${error.message}`);
    }
  }
}

testModels();
