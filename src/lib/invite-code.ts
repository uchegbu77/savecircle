export function generateInviteCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let index = 0; index < 8; index++) {
    const randomIndex = Math.floor(
      Math.random() * characters.length,
    );

    code += characters[randomIndex];
  }

  return code;
}