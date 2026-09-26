export const colors = {
  ink: "#1e2b25",
  muted: "#718078",
  green: "#315e49",
  paper: "#f5f3ec",
  white: "#fffefa",
  line: "#dce1d8",
  orange: "#d27b50",
}

export function coordinates(latitude: number, longitude: number) {
  return `${Math.abs(latitude).toFixed(3)}° ${latitude < 0 ? "S" : "N"}, ${Math.abs(longitude).toFixed(3)}° ${longitude < 0 ? "W" : "E"}`
}
