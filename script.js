// ==================================================
// ELEMENTS
// ==================================================

const codeInput = document.getElementById("codeInput");
const language = document.getElementById("language");
const targetLanguage = document.getElementById("targetLanguage");

const responseText = document.getElementById("responseText");
const emptyState = document.getElementById("emptyState");
const loading = document.getElementById("loading");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

const lineNumbers = document.getElementById("lineNumbers");

const actionButtons =
    document.querySelectorAll(".action-btn");

// Chat elements
const chatMessages =
    document.getElementById("chatMessages");

const chatInput =
    document.getElementById("chatInput");

const chatSendBtn =
    document.getElementById("chatSendBtn");


// ==================================================
// LANGUAGE NAMES
// ==================================================

const languageNames = {

    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    csharp: "C#",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    typescript: "TypeScript",
    go: "Go",
    rust: "Rust"

};


// ==================================================
// FILE EXTENSIONS
// ==================================================

const fileExtensions = {

    javascript: "js",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    php: "php",
    html: "html",
    css: "css",
    sql: "sql",
    typescript: "ts",
    go: "go",
    rust: "rs"

};


// ==================================================
// LINE NUMBERS
// ==================================================

function updateLineNumbers() {

    if (!codeInput || !lineNumbers) {
        return;
    }

    const lines =
        codeInput.value.split("\n").length;

    let numbers = "";

    for (let i = 1; i <= lines; i++) {

        numbers += i + "\n";

    }

    lineNumbers.textContent = numbers;

}


if (codeInput) {

    codeInput.addEventListener(
        "input",
        updateLineNumbers
    );

    codeInput.addEventListener(
        "scroll",
        () => {

            lineNumbers.scrollTop =
                codeInput.scrollTop;

        }
    );

}

updateLineNumbers();


// ==================================================
// ACTION PROMPTS
// ==================================================

const actionPrompts = {

    generate: (
        sourceLanguage,
        targetLanguage,
        code
    ) => `

You are an expert software developer.

Generate complete working ${sourceLanguage} code.

User request/code:

${code}

Provide:

1. Complete working code
2. Clean implementation
3. Helpful comments
4. Short explanation
5. Time complexity where applicable

`,

    explain: (
        sourceLanguage,
        targetLanguage,
        code
    ) => `

You are an expert programming teacher.

Explain the following ${sourceLanguage} code
in very easy and beginner-friendly language.

CODE:

${code}

Provide:

1. What the code does
2. Important variables
3. Logic
4. Step-by-step explanation
5. Dry run with an example
6. Time complexity
7. Space complexity
8. Possible improvements

`,

    fix: (
        sourceLanguage,
        targetLanguage,
        code
    ) => `

You are an expert debugging engineer.

Analyze this ${sourceLanguage} code.

CODE:

${code}

Find:

1. Syntax errors
2. Logical errors
3. Runtime problems
4. Edge cases

Then provide:

1. BUGS FOUND
2. WHY THEY OCCUR
3. CORRECTED COMPLETE CODE
4. EASY EXPLANATION
5. TIME COMPLEXITY
6. SPACE COMPLEXITY

Keep the original functionality unchanged.

`,

    optimize: (
        sourceLanguage,
        targetLanguage,
        code
    ) => `

You are an expert software performance engineer.

Optimize this ${sourceLanguage} code.

CODE:

${code}

Provide:

1. Problems in current implementation
2. Performance improvements
3. Better coding practices
4. Optimized complete code
5. Time complexity before
6. Time complexity after
7. Space complexity

Keep the original functionality unchanged.

`,

    convert: (
        sourceLanguage,
        targetLanguage,
        code
    ) => `

You are an expert multi-language programmer.

Convert the following code from
${sourceLanguage} to ${targetLanguage}.

SOURCE CODE:

${code}

Requirements:

1. Preserve original functionality
2. Provide complete converted code
3. Use proper ${targetLanguage} syntax
4. Follow ${targetLanguage} best practices
5. Explain important differences
6. Mention features requiring a different approach

`,

    tests: (
        sourceLanguage,
        targetLanguage,
        code
    ) => `

You are an expert software testing engineer.

Create comprehensive test cases for this
${sourceLanguage} code.

CODE:

${code}

Provide:

1. Normal test cases
2. Edge cases
3. Invalid input cases
4. Complete test code
5. Expected results
6. Explanation of important tests

`

};


// ==================================================
// SHOW RESPONSE
// ==================================================

function showResponse(text) {

    if (!responseText || !emptyState) {
        return;
    }

    emptyState.classList.add("hidden");

    responseText.classList.remove("hidden");

    responseText.textContent =
        text || "No response received.";

}


// ==================================================
// LOADING
// ==================================================

function showLoading() {

    if (loading) {

        loading.classList.remove("hidden");

    }

}


function hideLoading() {

    if (loading) {

        loading.classList.add("hidden");

    }

}


// ==================================================
// MAIN AI REQUEST
// ==================================================

async function runAssistant(action) {

    const code =
        codeInput.value.trim();

    const sourceLanguage =
        languageNames[language.value] ||
        language.value;

    const selectedTargetLanguage =
        languageNames[targetLanguage.value] ||
        targetLanguage.value;


    // ------------------------------------------
    // CODE CHECK
    // ------------------------------------------

    if (!code) {

        showResponse(
            "⚠️ Please enter some code first."
        );

        codeInput.focus();

        return;

    }


    // ------------------------------------------
    // PROMPT
    // ------------------------------------------

    const promptBuilder =
        actionPrompts[action];


    if (!promptBuilder) {

        showResponse(
            "❌ Invalid action."
        );

        return;

    }


    const prompt =
        promptBuilder(
            sourceLanguage,
            selectedTargetLanguage,
            code
        );


    showLoading();


    // Disable buttons

    actionButtons.forEach(button => {

        button.disabled = true;

    });


    copyBtn.disabled = true;
    downloadBtn.disabled = true;


    try {

        console.log(
            "🤖 Sending request to backend..."
        );


        const response =
            await fetch("https://TUMHARA-RENDER-URL.onrender.com/api/code", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    action: action,

                    language:
                        sourceLanguage,

                    sourceLanguage:
                        sourceLanguage,

                    targetLanguage:
                        selectedTargetLanguage,

                    code: code,

                    prompt: prompt

                })

            });


        const data =
            await response.json();


        console.log(
            "Backend response:",
            data
        );


        if (!response.ok ||
            !data.success) {

            throw new Error(

                data.error ||
                data.details ||
                "AI request failed."

            );

        }


        // Backend sends result

        const result =

            data.result ||
            data.response ||
            data.message;


        if (!result) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        showResponse(result);


        copyBtn.disabled = false;
        downloadBtn.disabled = false;


    } catch (error) {

        console.error(
            "❌ AI Assistant Error:",
            error
        );


        showResponse(

            "❌ Something went wrong.\n\n" +
            error.message

        );

    } finally {

        hideLoading();


        actionButtons.forEach(button => {

            button.disabled = false;

        });

    }

}


// ==================================================
// ACTION BUTTON EVENTS
// ==================================================

actionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const action =
                button.dataset.action;

            runAssistant(action);

        }
    );

});


// ==================================================
// CLEAR BUTTON
// ==================================================

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        () => {

            codeInput.value = "";

            updateLineNumbers();


            responseText.textContent = "";

            responseText.classList.add(
                "hidden"
            );

            emptyState.classList.remove(
                "hidden"
            );


            copyBtn.disabled = true;

            downloadBtn.disabled = true;


            codeInput.focus();

        }
    );

}


// ==================================================
// COPY
// ==================================================

copyBtn.addEventListener(
    "click",
    async () => {

        const text =
            responseText.textContent.trim();


        if (!text) {
            return;
        }


        try {

            await navigator.clipboard
                .writeText(text);


            const oldText =
                copyBtn.textContent;


            copyBtn.textContent =
                "✅ Copied!";


            setTimeout(
                () => {

                    copyBtn.textContent =
                        oldText;

                },
                1500
            );


        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );

        }

    }
);


// ==================================================
// DOWNLOAD
// ==================================================

downloadBtn.addEventListener(
    "click",
    () => {

        const text =
            responseText.textContent.trim();


        if (!text) {

            showResponse(
                "⚠️ No AI response to download."
            );

            return;

        }


        const selectedLanguage =
            language.value;


        const extension =
            fileExtensions[
                selectedLanguage
            ] || "txt";


        // Extract code block

        let codeToDownload = text;


        const codeBlock =
            text.match(
                /```(?:[a-zA-Z0-9+#-]+)?\s*([\s\S]*?)```/
            );


        if (codeBlock) {

            codeToDownload =
                codeBlock[1].trim();

        }


        const blob =
            new Blob(
                [codeToDownload],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            `ai-code-${Date.now()}.${extension}`;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);


        const oldText =
            downloadBtn.textContent;


        downloadBtn.textContent =
            "✅ Downloaded";


        setTimeout(
            () => {

                downloadBtn.textContent =
                    oldText;

            },
            1800
        );

    }
);


// ==================================================
// TAB SUPPORT
// ==================================================

codeInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Tab") {

            event.preventDefault();


            const start =
                codeInput.selectionStart;

            const end =
                codeInput.selectionEnd;


            codeInput.value =

                codeInput.value.substring(
                    0,
                    start
                )

                +

                "    "

                +

                codeInput.value.substring(
                    end
                );


            codeInput.selectionStart =
                start + 4;

            codeInput.selectionEnd =
                start + 4;


            updateLineNumbers();

        }

    }
);


// ==================================================
// CTRL + ENTER
// ==================================================

codeInput.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            runAssistant("generate");

        }

    }
);


// ==================================================
// CHAT HELPERS
// ==================================================

function addChatMessage(
    sender,
    message
) {

    const messageDiv =
        document.createElement("div");


    messageDiv.classList.add(
        "chat-message",
        sender
    );


    const label =
        document.createElement("span");


    label.classList.add(
        "chat-message-label"
    );


    // label.textContent =
    //     sender === "user"
    //         ? "You"
    //         : "Gemini";
label.textContent =
    sender === "user"
        ? "You"
        : "AI Assistant";

    const content =
        document.createElement("div");


    content.textContent =
        message;


    messageDiv.appendChild(label);

    messageDiv.appendChild(content);


    chatMessages.appendChild(
        messageDiv
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ==================================================
// CHAT LOADING MESSAGE
// ==================================================

function addChatLoading() {

    const loadingMessage =
        document.createElement("div");


    loadingMessage.id =
        "chatLoadingMessage";


    loadingMessage.className =
        "chat-message ai";


    loadingMessage.innerHTML =
        `
        <span class="chat-message-label">
            Gemini
        </span>
        🤔 Thinking...
        `;


    chatMessages.appendChild(
        loadingMessage
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


function removeChatLoading() {

    const element =
        document.getElementById(
            "chatLoadingMessage"
        );


    if (element) {

        element.remove();

    }

}


// ==================================================
// SEND CHAT
// ==================================================

async function sendChatMessage() {

    const message =
        chatInput.value.trim();


    if (!message) {

        return;

    }


    // Add user message

    addChatMessage(
        "user",
        message
    );


    // Clear input

    chatInput.value = "";


    // Disable

    chatSendBtn.disabled = true;


    addChatLoading();


    try {

        // ------------------------------------------
        // CURRENT CODE CONTEXT
        // ------------------------------------------

        const currentCode =
            codeInput.value.trim();


        const currentLanguage =
            languageNames[
                language.value
            ] || language.value;


        console.log(
            "💬 Sending chat request..."
        );


        // ------------------------------------------
        // BACKEND REQUEST
        // ------------------------------------------

        const response =
            await fetch("https://TUMHARA-RENDER-URL.onrender.com/api/code", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    action: "chat",

                    language:
                        currentLanguage,

                    code:
                        currentCode,

                    message:
                        message

                })

            });


        const data =
            await response.json();


        console.log(
            "Chat response:",
            data
        );


        if (!response.ok ||
            !data.success) {

            throw new Error(

                data.error ||
                data.details ||
                "Chat request failed."

            );

        }


        const result =

            data.result ||
            data.response ||
            data.message;


        if (!result) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        removeChatLoading();


        addChatMessage(
            "ai",
            result
        );


    } catch (error) {

        console.error(
            "❌ Chat Error:",
            error
        );


        removeChatLoading();


        addChatMessage(

            "ai",

            "❌ Error: " +
            error.message

        );

    } finally {

        chatSendBtn.disabled =
            false;

        chatInput.focus();

    }

}


// ==================================================
// CHAT SEND BUTTON
// ==================================================

if (chatSendBtn) {

    chatSendBtn.addEventListener(
        "click",
        sendChatMessage
    );

}


// ==================================================
// CHAT KEYBOARD
// ==================================================

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

            // Enter = Send
            // Shift + Enter = New line

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendChatMessage();

            }

        }
    );

}


// ==================================================
// LANGUAGE CHANGE
// ==================================================

language.addEventListener(
    "change",
    () => {

        if (
            targetLanguage.value ===
            language.value
        ) {

            const option =
                Array.from(
                    targetLanguage.options
                ).find(
                    item =>
                        item.value !==
                        language.value
                );


            if (option) {

                targetLanguage.value =
                    option.value;

            }

        }

    }
);


// ==================================================
// TARGET LANGUAGE CHANGE
// ==================================================

targetLanguage.addEventListener(
    "change",
    () => {

        if (
            targetLanguage.value ===
            language.value
        ) {

            const option =
                Array.from(
                    targetLanguage.options
                ).find(
                    item =>
                        item.value !==
                        language.value
                );


            if (option) {

                targetLanguage.value =
                    option.value;

            }

        }

    }
);


// ==================================================
// INITIAL STATE
// ==================================================

copyBtn.disabled = true;

downloadBtn.disabled = true;

updateLineNumbers();

console.log(
    "✅ AI Code Assistant loaded."
);

console.log(
    "💬 AI Chat Assistant ready."
);
