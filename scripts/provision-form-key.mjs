// Operator tool: Windows DPAPI recovery artifact + write-only Vercel Secret.
// Never prints keys, child output or ciphertext. Does not enable collection.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { registerHooks } from "node:module";
// Next supplies this marker at build time. The operator tool runs only in Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { encrypt, decrypt } = await import("../src/lib/forms/crypto.ts");

function child(command, args, input) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    process.stdout.on("data", (chunk) => {
      output += chunk;
    });
    process.stderr.on("data", () => {});
    process.on("error", () =>
      reject(new Error("Provisioning subprocess could not start.")),
    );
    process.on("close", (code) =>
      code === 0
        ? resolve(output)
        : reject(
            new Error(
              "Provisioning subprocess failed. No secret output is displayed.",
            ),
          ),
    );
    process.stdin.end(input);
  });
}
const keyId = "envet-2026-10-v1";
const checkRecovery = process.argv.includes("--check-recovery");
const ring = JSON.stringify({ [keyId]: randomBytes(32).toString("base64") });
const powershell = `
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Security
$desktopDirectory=[Environment]::GetFolderPath('Desktop')
$recoveryPath=Join-Path $desktopDirectory 'ENVET-Form-Encryption-Recovery-2026-10.dpapi'
if (${checkRecovery ? "$true" : "$false"}) {
  $restored=[Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($recoveryPath),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser))
  @{path=$recoveryPath;restored=$restored}|ConvertTo-Json -Compress
  exit
}
if(Test-Path -LiteralPath $recoveryPath){throw 'Recovery file already exists; do not replace retained keys.'}
$keyText=[Console]::In.ReadToEnd()
$sealed=[Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($keyText),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
[IO.File]::WriteAllBytes($recoveryPath,$sealed)
$restored=[Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($recoveryPath),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser))
@{path=$recoveryPath;restored=$restored}|ConvertTo-Json -Compress
`;
const recovered = JSON.parse(
  await child(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", powershell],
    ring,
  ),
);
if (!checkRecovery && recovered.restored !== ring)
  throw new Error("Recovery verification failed.");
process.env.FORM_ACTIVE_KEY_ID = keyId;
process.env.FORM_ENCRYPTION_KEYS = recovered.restored;
const fixture = {
  purpose: "synthetic recovery check, not a signed ENVET record",
};
const box = encrypt(fixture, "envet:recovery-test:v1");
process.env.FORM_ENCRYPTION_KEYS = recovered.restored;
if (decrypt(box, "envet:recovery-test:v1").purpose !== fixture.purpose)
  throw new Error("Restored record failed.");
process.env.FORM_ENCRYPTION_KEYS = JSON.stringify({
  [keyId]: randomBytes(32).toString("base64"),
});
let denied = false;
try {
  decrypt(box, "envet:recovery-test:v1");
} catch {
  denied = true;
}
if (!denied) throw new Error("Wrong key was not rejected.");
delete process.env.FORM_ENCRYPTION_KEYS;
delete process.env.FORM_ACTIVE_KEY_ID;
if (!checkRecovery)
  await child(
    "cmd.exe",
    [
      "/d",
      "/c",
      "npx --yes vercel env add FORM_ENCRYPTION_KEYS production --type secret --yes --project envet --scope ryanverweys-projects",
    ],
    recovered.restored,
  );
console.log(`Encrypted recovery artifact: ${recovered.path}`);
console.log(
  `Restored artifact decrypted synthetic evidence; wrong key rejected. ${checkRecovery ? "No cloud changes." : "Production Secret saved. Collection unchanged."}`,
);
