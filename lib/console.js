import { createInterface } from 'node:readline';

export function consoleInput() {
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const lines = input[Symbol.asyncIterator]();
  return {
    async ask(prompt) {
      process.stdout.write(prompt);
      const line = await lines.next();
      return line.done ? null : line.value.trim();
    },
    close() { input.close(); }
  };
}
