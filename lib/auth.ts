import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const requireUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (claims?.claims?.sub) return { id: claims.claims.sub };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
});
