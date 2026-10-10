import { apiJson } from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { memberFirstName } from "@/lib/community/member";

export async function GET() {
  try {
    const user = await currentUser();
    let manager = false;
    const service = user ? serviceClient() : null;
    if (service && user) {
      const { data, error } = await service.rpc("staff_access", {
        p_actor: user.id,
      });
      manager = !error && data === true;
    }
    return apiJson({
      signedIn: !!user,
      firstName: user ? memberFirstName(user.user_metadata) : null,
      manager,
    });
  } catch {
    return apiJson({ error: "Your session could not be checked." }, 503);
  }
}
