"use client";

import { Button, Input, message, Typography } from "antd";
import { useState } from "react";

async function fetchAI(rawData: { topic: string; opt1: string; opt2: string }) {
    const response = await fetch("/api/ask", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(rawData),
    });

    if (response.status === 200) {
        const resData = await response.json();
        return { ok: true, message: "Success", data: resData?.data };
    } else {
        return { ok: false, message: JSON.stringify(response.json()) };
    }
}

export default function Home() {
    const [topik, setTopik] = useState("");
    const [inputOne, setInputOne] = useState("");
    const [inputTwo, setInputTwo] = useState("");
    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function onClickGenerate() {
        if (!topik || !inputOne || !inputTwo) {
            message.error("Topik, Opsi 1 dan Opsi 2 harap diisi!");
            return;
        }
        setOutput("");
        setIsLoading(true);
        const res = await fetchAI({
            topic: topik,
            opt1: inputOne,
            opt2: inputTwo,
        });
        if (res.ok) {
            setOutput(String(res.data));
        } else {
            message.error(res.message);
        }
        setIsLoading(false);
    }
    return (
        <main className="bg-blue-200 min-h-screen w-full !p-0">
            <div className="block max-w-lg mx-auto rounded-lg p-4">
                <Typography.Title level={3}>Topik</Typography.Title>
                <Input
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    disabled={isLoading}
                    placeholder="Contoh : Kuliah Informatika"
                />
                <Typography.Title level={4}>Mending</Typography.Title>
                <Input
                    value={inputOne}
                    onChange={(e) => setInputOne(e.target.value)}
                    disabled={isLoading}
                    placeholder="Contoh : UI"
                />
                <Typography.Title level={4}>Atau</Typography.Title>
                <Input
                    value={inputTwo}
                    onChange={(e) => setInputTwo(e.target.value)}
                    disabled={isLoading}
                    placeholder="Contoh : ITB"
                />
                <Button
                    size="large"
                    onClick={onClickGenerate}
                    className="my-4"
                    type="primary"
                    loading={isLoading}
                >
                    Tanya Gemini AI
                </Button>
                <Input.TextArea rows={8} value={output}></Input.TextArea>
            </div>
        </main>
    );
}
