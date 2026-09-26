import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const themes = {
  "piano-dawn": [261.63, 329.63, 392, 523.25],
  "guitar-road": [196, 246.94, 293.66, 392],
  "piano-memory": [130.81, 164.81, 196, 261.63],
}
const sampleRate = 22050
const seconds = 4

function wav(frequencies) {
  const count = sampleRate * seconds
  const data = Buffer.alloc(count * 2)
  for (let i = 0; i < count; i++) {
    const time = i / sampleRate
    const envelope = Math.min(1, time * 8, (seconds - time) * 8)
    const value = frequencies.reduce((sum, frequency) => sum + Math.sin(2 * Math.PI * frequency * time), 0) / frequencies.length
    data.writeInt16LE(Math.max(-1, Math.min(1, value * envelope)) * 32767, i * 2)
  }
  const header = Buffer.alloc(44)
  header.write("RIFF", 0); header.writeUInt32LE(36 + data.length, 4); header.write("WAVE", 8)
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

const output = join(import.meta.dirname, "../assets/themes")
await mkdir(output, { recursive: true })
await Promise.all(Object.entries(themes).map(([name, notes]) => writeFile(join(output, `${name}.wav`), wav(notes))))
