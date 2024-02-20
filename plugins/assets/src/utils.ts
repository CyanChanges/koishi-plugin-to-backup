export function toDataURL(buffer: Buffer) {
  const base64 = buffer.toString("base64")
  return `data:;base64,${base64}`
}
