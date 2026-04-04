export default function CauseError() {
  // Throw during server render to trigger the app-level error UI
  throw new Error("Página de teste: erro intencional para demonstrar 500.");
}
