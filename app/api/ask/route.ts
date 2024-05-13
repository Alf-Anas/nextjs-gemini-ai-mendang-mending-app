import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";

async function runCompare(topic: string, opt1: string, opt2: string) {
    const MODEL_NAME = "gemini-1.0-pro";
    if (!API_KEY) {
        console.error("Please provide the API Key.");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const parts = [
        {
            text: `Please choose your answer given by user delimited by triple dash below and give short reason why. You will answer in Bahasa Indonesia.\n\nExample:\nUser: Mending laptop atau rakit pc?\nAsisten: Mending merakit PC, karena:\n\n* Lebih hemat biaya\n* Lebih fleksibel dalam memilih komponen\n* Dapat di-upgrade dengan mudah\n* Lebih cocok untuk kebutuhan spesifik\n\n\n\n---\n\nUser: ${topic} mending ${opt1} atau ${opt2}?`,
        },
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
    });

    const { response } = result;
    return response.text();
}

export async function POST(request: Request) {
    const { topic, opt1, opt2 } = await request.json();

    if (!topic || !opt1 || !opt2) {
        return NextResponse.json(
            {
                error: true,
                message: "Topik, opsi 1 dan opsi 2 tidak boleh kosong!",
            },
            { status: 422 }
        );
    }

    try {
        const res = await runCompare(topic, opt1, opt2);
        return NextResponse.json({ success: true, data: res }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
