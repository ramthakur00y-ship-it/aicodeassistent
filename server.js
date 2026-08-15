require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// GROQ
// ==========================================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json({
    limit: "2mb"
}));

app.use(express.static(
    path.join(__dirname, "public")
));

// ==========================================
// HEALTH
// ==========================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "AI Code Assistant backend is running"
    });

});

// ==========================================
// TEST GROQ
// ==========================================

app.get("/api/test-groq", async (req, res) => {

    try {

        console.log("Testing Groq...");

        const response = await groq.chat.completions.create({

            model: "llama-3.1-8b-instant",

            messages: [
                {
                    role: "user",
                    content:
                        "Reply with exactly: AI connection successful."
                }
            ],

            temperature: 0.2

        });

        const result =
            response.choices?.[0]?.message?.content;

        console.log("Groq response:", result);

        res.json({

            success: true,

            message:
                result || "AI connection successful."

        });

    } catch (error) {

        console.error("❌ Groq test error:");
        console.error(error);

        res.status(500).json({

            success: false,

            error: "AI connection failed",

            details:
                error.message

        });

    }

});

// ==========================================
// AI CODE
// ==========================================

app.post("/api/code", async (req, res) => {

    try {

        const {
            action,
            language,
            code,
            sourceLanguage,
            targetLanguage,
            message
        } = req.body;

        console.log("");
        console.log("======================================");
        console.log("🤖 AI REQUEST");
        console.log("Action:", action);
        console.log("Language:", language);
        console.log("======================================");

        if (!action) {

            return res.status(400).json({

                success: false,

                error: "Action is required"

            });

        }

        let prompt = "";

        // ==========================================
        // GENERATE
        // ==========================================

        if (action === "generate") {

            prompt = `
You are an expert software developer.

Generate complete working ${language} code.

User input:

${code}

Provide:
1. Complete code
2. Explanation
3. Best practices
4. Time complexity if applicable
`;

        }

        // ==========================================
        // FIX BUGS
        // ==========================================

        else if (action === "fix") {

            prompt = `
You are an expert debugging engineer.

Analyze the following ${language} code.

CODE:

${code}

Find all bugs and provide:

1. BUGS FOUND
2. WHY THE BUGS OCCUR
3. COMPLETE CORRECTED CODE
4. EASY EXPLANATION
5. TIME COMPLEXITY
6. SPACE COMPLEXITY

Keep the original functionality unchanged.
`;

        }

        // ==========================================
        // EXPLAIN
        // ==========================================

        else if (action === "explain") {

            prompt = `
You are an expert programming teacher.

Explain this ${language} code in very easy language.

CODE:

${code}

Provide:

1. What the code does
2. Important variables
3. Logic
4. Step-by-step explanation
5. Dry run
6. Time complexity
7. Space complexity
`;

        }

        // ==========================================
        // OPTIMIZE
        // ==========================================

        else if (action === "optimize") {

            prompt = `
You are an expert software engineer.

Optimize this ${language} code.

CODE:

${code}

Provide:

1. Problems in current code
2. Complete optimized code
3. Improvements
4. Time complexity before
5. Time complexity after
6. Space complexity
`;

        }

        // ==========================================
        // CONVERT
        // ==========================================

        else if (action === "convert") {

            prompt = `
Convert this code from ${sourceLanguage}
to ${targetLanguage}.

CODE:

${code}

Requirements:

1. Preserve functionality.
2. Provide complete code.
3. Use proper ${targetLanguage} syntax.
4. Explain important differences.
`;

        }

        // ==========================================
        // TEST CASES
        // ==========================================

        else if (action === "tests") {

            prompt = `
You are an expert software testing engineer.

Create comprehensive test cases for this ${language} code.

CODE:

${code}

Provide:

1. Normal test cases
2. Edge cases
3. Invalid cases
4. Complete test code
5. Expected results
6. Explanation
`;

        }

        // ==========================================
        // CHAT
        // ==========================================

        else if (action === "chat") {

            prompt = `
You are an AI programming assistant.

Language:

${language}

Current code:

${code || "No code provided."}

User question:

${message}

Answer clearly in easy language.

If code is required, provide complete code.
`;

        }

        else {

            return res.status(400).json({

                success: false,

                error: "Invalid action"

            });

        }

        // ==========================================
        // GROQ REQUEST
        // ==========================================

        console.log("⏳ Sending request to Groq...");

        const response =
            await groq.chat.completions.create({

                model: "llama-3.1-8b-instant",

                messages: [

                    {
                        role: "system",
                        content:
                            "You are a helpful expert programming assistant. Give accurate, clear and beginner-friendly answers."
                    },

                    {
                        role: "user",
                        content: prompt
                    }

                ],

                temperature: 0.3,

                max_tokens: 4096

            });

        // ==========================================
        // GET RESPONSE
        // ==========================================

        const result =
            response.choices?.[0]?.message?.content;

        console.log("✅ Groq request completed.");

        console.log("AI response:");
        console.log(result);

        // ==========================================
        // EMPTY RESPONSE CHECK
        // ==========================================

        if (!result || result.trim() === "") {

            console.error(
                "❌ AI returned empty response."
            );

            return res.status(500).json({

                success: false,

                error:
                    "AI returned an empty response."

            });

        }

        // ==========================================
        // SEND RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            result: result

        });

        console.log(
            "✅ Response sent to frontend."
        );

    } catch (error) {

        console.error("");
        console.error("======================================");
        console.error("❌ AI API ERROR");
        console.error("======================================");
        console.error(error);
        console.error("======================================");

        res.status(500).json({

            success: false,

            error: "AI request failed",

            details:
                error.message

        });

    }

});

// ==========================================
// FRONTEND FALLBACK
// ==========================================

app.use((req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("🚀 AI Code Assistant Started");
    console.log("======================================");
    console.log(
        `🌐 Open: http://localhost:${PORT}`
    );
    console.log(
        `❤️ Health: http://localhost:${PORT}/api/health`
    );
    console.log(
        `🤖 AI Test: http://localhost:${PORT}/api/test-groq`
    );
    console.log("======================================");
    console.log("");

});