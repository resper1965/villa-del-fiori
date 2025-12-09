import { supabase } from "@/lib/supabase/client"

/**
 * Atualiza app_metadata do usuário no Supabase Auth via Edge Function
 * app_metadata é seguro e não pode ser modificado pelo usuário
 */
export async function updateUserAppMetadata(
  userId: string,
  appMetadata: {
    user_role?: "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"
    is_approved?: boolean
    approved_at?: string
    approved_by?: string
  }
) {
  const { data, error } = await supabase.functions.invoke("update-user-metadata", {
    body: {
      userId,
      appMetadata,
    },
  })

  if (error) {
    throw error
  }

  return data
}

