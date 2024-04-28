export function generateInviteCodes(): string[] {
  const result: string[] = [];

  for (let i = 0; i < 100; i++) {
    const code = generateAlphanumericCode(6);

    result.push(code);
  }

  return result;
}

function generateAlphanumericCode(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}
