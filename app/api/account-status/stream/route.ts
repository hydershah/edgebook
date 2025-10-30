import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { statusBroadcast } from "@/lib/statusBroadcast";

/**
 * SSE endpoint for real-time account status updates
 * Uses Server-Sent Events for efficient one-way communication
 */
export async function GET(req: NextRequest) {
  // Authenticate user
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialData = `data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Subscribe to status changes for this user
      const unsubscribe = statusBroadcast.subscribe(userId, (change) => {
        try {
          const message = `data: ${JSON.stringify({
            type: 'status_change',
            ...change,
            timestamp: change.timestamp.toISOString(),
            suspendedUntil: change.suspendedUntil?.toISOString() || null,
          })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      });

      // Keep-alive ping every 30 seconds to prevent timeout
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (error) {
          // Connection closed, cleanup
          clearInterval(keepAliveInterval);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        unsubscribe();
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
