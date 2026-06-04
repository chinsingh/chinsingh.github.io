---
title: Streaming LLM Responses with Server-Sent Events
date: 2026-01-17
display_date: January 17, 2026
section: Shipping AI
field: Software
draft: false
---

If you decide to wait till an LLM is done with its response, you'd probably end up never using it.  Luckily, LLMs are able to emit tokens one at a time. This allows AI applications to stream their response as it is emitted. 

The mechanism used for this purpose is Server-Sent Events (SSE). 

## Server Sent Events (SSE)

SSE is an HTTP response format described by [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html) for servers to push data to a browser over a persistent HTTP connection. 

> **Web Hypertext Application Technology Working Group** or **WHATWG** maintains the HTML Living Standard which specifies how browsers should work. Which makes SSE more of a browser thing rather than an internet standard which are maintained by IETF and W3C. 

The server sends a response with `Content-Type: text/event-stream` and keeps the connection open, writing events whenever it has something to say. The client receives them as they arrive.

The wire format is minimal. Each event is one or more `data:` lines followed by a blank line:

```txt
data: This is the first message.

data: This is the second message, it
data: has two lines.

data: This is the third message.

```

Events can also carry these other fields: 
- `id:` Used for reconnection. The browser sends the last received ID in a `Last-Event-ID` header when it reconnects.
- `event:` For named event types. But in practice you often skip both and just put all the information in the `data:` JSON payload itself.

The browser exposes this via the `EventSource` API:

```js
const source = new EventSource('/api/stream');
source.onmessage = (e) => console.log(JSON.parse(e.data));
```

That's all the client needs. The browser handles reconnection automatically if the connection drops.

### Why Not WebSockets

At this point, you might have this question if you're familiar with WebSockets since it also pushes data from server to client without the client polling.

And you can actually use WebSockets for this purpose as well, but it would be like using a bulldozer to hammer a nail. WebSockets are bidirectional and work great for chat, collaborative editing, multiplayer games. But for the much simpler use case of streaming text, the client just sends one request and only listens - unidirectional.

SSE also runs over plain HTTP. It's just a long-lived response. While WebSockets require a connection upgrade and a lot of custom logic just to work. 

SSE is just the right tool for this use case. But I don't use it as it is. 

## My Setup

It has three participants: an LLM API, my Node.js server, and the browser. The LLM API itself streams SSE. So the server receives a stream and has to forward it to the browser as a new stream.

```d2
direction: right
LLM API -> Express Server: SSE
Express Server -> Browser: SSE
```

On the server side, I use Axios with `responseType: 'stream'` to consume the LLM's SSE response as a Node.js readable stream, then call `res.write()` to push each event down to the browser.

```js
const response = await axios.post(LLM_ENDPOINT, payload, {
  responseType: 'stream'
});

response.data.on('data', (chunk) => {

  for (const line of chunk.toString().split('\n')) {

    if (!line.startsWith('data: ')) continue;

    const raw = line.slice(6).trim();

    if (raw === '[DONE]') continue;

    const parsed = JSON.parse(raw);
    const content = parsed.generations?.[0]?.text || '';

    if (content) {
      buffer += content;
      const partial = tryParsePartialJson(buffer);
      if (partial) {
        res.write(`data: ${JSON.stringify({ type: 'partial', data: partial })}\n\n`);
      }
    }
  }
});

response.data.on('end', () => {
  const final = JSON.parse(buffer);
  res.write(`data: ${JSON.stringify({ type: 'complete', data: final })}\n\n`);
  res.end();
});
```

The server also needs three headers:
- **`Content-Type: text/event-stream`**: Standard SSE header. Tells the browser to treat it as a stream rather than a regular one-shot response body.
- **`Cache-Control: no-cache`**: Prevents proxies and the browser from caching the response. Without this, intermediaries might buffer the entire response before forwarding it.
- **`Connection: keep-alive`**: Instructs the underlying TCP connection to stay open. Without it, the connection could be closed after what looks like a complete HTTP response.

> ❗️If you're using a reverse proxy, this can break production. Reverse proxies buffer HTTP responses by default, waiting to accumulate enough data before forwarding. SSE events held in a buffer don't reach the browser until the buffer is flushed, defeating the whole point.
>
> For Nginx, the fix is one header: `res.setHeader('X-Accel-Buffering', 'no')`. This is an Nginx directive that can be set via a response header. Setting it to `no` tells Nginx to pass each write through immediately. Other reverse proxies have their own equivalent mechanisms.

## Out of the SSE Box

SSE was originally meant for live feeds and stock tickers - much lighter use cases. With AI applications, the requirements go further. But there are common patterns and practices already. 

### `fetch()` Instead of `EventSource`

The browser has a native `EventSource` API for SSE. You'd think to use it here, but there's a catch: `EventSource` only supports GET requests. My endpoint needs a request body (the user's prompt, some config), so I can't use GET.

The standard approach across LLM apps and SDKs is using `fetch()` with the Streams API. 

```js
const response = await fetch('/api/ai/suggest/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, pricebookId }),
  signal: abortController.signal
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';


while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep the incomplete last line

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = JSON.parse(line.slice(6));
    handleEvent(data);
  }
}
```

The `buffer = lines.pop()` line is the important bit. A TCP chunk can arrive mid-event. The `data:` line might be split across two `reader.read()` calls. Keeping the last (potentially incomplete) line in the buffer and prepending it to the next chunk handles this correctly.

The `AbortController` signal gives you cancellation for free: pass it to `fetch`, and calling `abort()` tears down the connection. I use this when the user navigates away or explicitly cancels.

### Streaming Structured Data

Streaming plain text is straightforward. My case had the LLM generating structured JSON. When formed completely, this JSON would fill up a table on the front-end. But I wanted to stream this table, which would involve parsing the half-baked JSON as it poured in and putting the values in the right rows and column. 

The problem is that JSON is only valid once it's complete. A mid-stream buffer like `{"items":[{"name":"Cloud S` will fail `JSON.parse`.

I used a library called [`partial-json`](https://www.npmjs.com/package/partial-json) for this. It parses whatever is valid so far in an incomplete JSON string. So `{"items":[{"name":"Cloud S` becomes `{ items: [{ name: "Cloud S" }] }`. It handles open arrays, open objects, truncated strings.

```js
import { parse } from 'partial-json';

// On each chunk from the LLM:
buffer += newContent;
try {
  const partial = parse(buffer);
  if (partial && typeof partial === 'object') {
    onChunk(partial); // send to frontend
  }
} catch (_) {
  // buffer not yet parseable, keep accumulating
}
```

This lets the UI show suggestions appearing one by one as the LLM generates them, even though the final response is a single JSON object.

### One Stream, Multiple Concerns

A streaming LLM call isn't just one thing happening. Before the LLM even runs, my server does some prep work (extracting context, building a plan). I wanted the UI to reflect each of these phases, not just sit on a spinner until the first chunk arrived.

Instead of opening multiple connections, I used a typed event protocol over the same SSE stream:

```js
// Server emits these as the pipeline progresses:
{ type: 'phase',    phase: 'extracting_context' }
{ type: 'phase',    phase: 'building_plan' }
{ type: 'partial',  data: { items: [...] } }      // LLM streaming
{ type: 'complete', data: { items: [...] } }       // final result
{ type: 'error',    message: '...' }               // on failure
```

The client switches on `data.type` and updates the UI accordingly, changing the status message during the pipeline phases, then rendering incremental suggestions as `partial` events arrive.

Using JSON payloads over a single typed channel is simpler than SSE's native `event:` field, because you can carry arbitrary structured data alongside the type. And since you're already parsing lines manually via `fetch()`, the native `event:` field would just be one more thing to parse out.

## Error Handling

Errors during streaming are awkward: you've already sent a `200 OK` status and started writing the body, so you can't send an HTTP error code anymore. The solution is to send an error event over the stream and close it.

```js
res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
res.end();
```

On the client, the `error` event triggers the same cleanup and user-facing message as any other error path. The important thing is to always call `res.end()`. Leaving the connection open after an error will hang the client.

## The Before/After

Streaming is becoming an increasingly common pattern in AI applications, and for good reason. The non-streaming version was a regular `async/await` call: send request, wait several seconds, return JSON. Straightforward to write, but the UX was a fixed spinner with no indication of progress.

This created an impression of a slow application, with users saying they might just do it manually.

The streaming version is more moving parts but the result is that the user sees each phase as it happens and suggestions start appearing well before the LLM finishes. For a feature people are waiting on, that matters.