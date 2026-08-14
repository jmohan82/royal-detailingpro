export function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function normalizePlate(plate: string): string {
  return plate.replace(/[\s-]/g, "").toUpperCase();
}
