export function getAlertTransition(currentStatus, conditionIsUnsafe) {
  const isOpen = currentStatus === "active" || currentStatus === "acknowledged";

  if (conditionIsUnsafe) {
    return isOpen ? "update" : "create";
  }
  return isOpen ? "resolve" : "none";
}
