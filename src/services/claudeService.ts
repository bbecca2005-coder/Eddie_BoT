export interface Message {
  role: "user" | "model";
  content: string;
}

export async function chatWithEddy(history: Message[]): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return (
        data?.content ||
        "Ugh, even my perfect circuits can't handle the nonsense you're feeding me. (Error connecting to my brain)."
      );
    }

    return (
      data?.content ||
      "My superior brain is currently experiencing a minor glitch. Try again, human."
    );
  } catch (err) {
    console.error("Eddy fetch error:", err);
    return "My link to the mainframe just went dark. Is the server running?";
  }
}
