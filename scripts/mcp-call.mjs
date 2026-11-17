import fs from 'node:fs';

// Local Blender Lab MCP transport. No model credentials are needed here.
export async function callBlender(name, args = {}, timeout = 120_000) {
  const response = await fetch('http://127.0.0.1:9191/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
    signal: AbortSignal.timeout(timeout),
  });
  const body = await response.text();
  const events = body.split('\n').filter(line => line.startsWith('data:')).map(line => JSON.parse(line.slice(5)));
  const message = events.at(-1) ?? JSON.parse(body);
  if (!response.ok || message.error || message.result?.isError) throw new Error(JSON.stringify(message));
  return message.result;
}

if (process.argv[2]) {
  const code = fs.readFileSync(process.argv[2], 'utf8');
  const result = await callBlender('execute_blender_code', { code });
  console.log(JSON.stringify(result.structuredContent ?? result));
}
