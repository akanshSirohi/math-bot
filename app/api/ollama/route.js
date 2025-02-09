import ollama from 'ollama'; // Ensure ollama is installed and imported

export async function POST(request) {
  try {
    const { model, messages } = await request.json();

    console.log(messages);
    const ollamaResponse = await ollama.chat({ model, messages, stream: true });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const part of ollamaResponse) {
          controller.enqueue(new TextEncoder().encode(part.message.content));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
