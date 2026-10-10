import { apiJson } from "@/lib/community/security";
import { currentUser } from "@/lib/community/supabase";
import { memberFirstName } from "@/lib/community/member";

export async function GET() {
  try {
    const user = await currentUser();
    return apiJson({
      signedIn: !!user,
      firstName: user ? memberFirstName(user.user_metadata) : null,
    });
  } catch {
    return apiJson({ error: "Your session could not be checked." }, 503);
  }
}
