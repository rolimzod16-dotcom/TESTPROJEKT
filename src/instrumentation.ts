export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSimulator } = await import("./lib/simulator");
    startSimulator();
  }
}