
// Copy of the updated safeParseJson function
const safeParseJson = (rawText) => {
    if (!rawText) return null;

    // Helper to attempt parsing
    const tryParse = (str) => {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    };

    // 1. Try extracting from code block
    const fromCodeFence = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fromCodeFence) {
        const parsed = tryParse(fromCodeFence[1]);
        if (parsed) return parsed;
    }

    // 2. Try direct parse (in case it's pure JSON)
    const direct = tryParse(rawText);
    if (direct) return direct;

    // 3. Try extracting the first valid JSON object structure
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = rawText.substring(firstBrace, lastBrace + 1);
        const extracted = tryParse(potentialJson);
        if (extracted) return extracted;
    }

    // 4. Fallback: If JSON is truncated, try to regex extract "narration" directly
    const narrationMatch = rawText.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if (narrationMatch) {
        return {
            narration: narrationMatch[1]
        };
    }

    return null;
};

// Test Cases
const testCases = [
    { name: 'Clean JSON', input: '{"narration": "Hello world", "companions": []}', expected: "Hello world" },
    { name: 'Truncated JSON', input: '{"narration": "Once upon a ti', expected: "Once upon a ti" },
    { name: 'Truncated JSON with escaped quote', input: '{"narration": "She said \\"Hello\\"', expected: "She said \\\"Hello\\\"" },
    { name: 'Messy Truncated', input: 'Here is potential JSON: {"narration": "Start of story...', expected: "Start of story..." },
    { name: 'No Narration', input: '{"other": "value"}', expected: null }
];

console.log('--- TESTING safeParseJson Fallback ---');
testCases.forEach(test => {
    const result = safeParseJson(test.input);
    const output = result ? result.narration : null;
    const success = output === test.expected;
    console.log(`[${success ? 'PASS' : 'FAIL'}] ${test.name}`);
    if (!success) console.log(`  Expected: '${test.expected}'\n  Got:      '${output}'`);
});
