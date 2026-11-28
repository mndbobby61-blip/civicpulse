import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastCount = -1;

  const stream = new ReadableStream({
    async start(controller) {
      const pushUnread = async () => {
        try {
          const unread = await db.notification.count({
            where: { userId: s.uid, isRead: false },
          });
          if (unread !== lastCount) {
            lastCount = unread;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ unread, at: Date.now() })}\n\n`)
            );
          } else {
            controller.enqueue(encoder.encode(": ping\n\n"));
          }
        } catch {
          // Ignore transient polling error inside stream
        }
      };

      await pushUnread();
      timer = setInterval(pushUnread, 8000);

      req.signal.addEventListener("abort", () => {
        if (timer) clearInterval(timer);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
