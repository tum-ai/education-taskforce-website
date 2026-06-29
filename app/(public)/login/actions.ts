"use server";

import { loginAction as loginActionImpl, type LoginActionState } from "@/lib/auth/actions";

export async function loginAction(previousState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  return loginActionImpl(previousState, formData);
}
