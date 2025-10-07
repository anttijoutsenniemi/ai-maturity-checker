export async function checkIfAdmin(salis: string): Promise<boolean> {
  const adminSalis = process.env.ADMIN_SALIS;

  if (!salis || !adminSalis) return false;

  return salis.toLowerCase() === adminSalis.toLowerCase();
}