"use server";

import { cookies } from "next/headers";
import { User } from "../entity/User";
import {
  userRepository,
  getUserUsecase,
  guessGroupListFromPoolSweepstake,
} from "../usecase/index";
import { GuessGroupListFromPoolSweepstakeParam } from "../usecase/GuessGroupListFromPoolSweepstake";
import { UserDto } from "../usecase/dto/UserDto";

/**
 * Log in the user by their username.
 * If the user does not exist in the repository, automatically create and save them first.
 */
export async function loginAction(
  name: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!name || !name.trim()) {
      return { success: false, error: "O nome de usuário é obrigatório." };
    }
    const trimmedName = name.trim();
    const id = encodeURIComponent(trimmedName);

    // Try to find the user
    let user = await userRepository.findById(id);
    if (!user) {
      // Auto-register user
      user = new User(trimmedName);
      await userRepository.save(user);
    }

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set("logged_in_user", id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Erro no loginAction:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao fazer login.",
    };
  }
}

/**
 * Log out the current user by deleting their session cookie.
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("logged_in_user");
  return { success: true };
}

/**
 * Retrieve the current logged-in user from the session cookie.
 */
export async function getLoggedInUser(): Promise<UserDto | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("logged_in_user");
    if (!userIdCookie || !userIdCookie.value) {
      return null;
    }
    const userId = userIdCookie.value;
    const user = await getUserUsecase.execute(userId);
    return user;
  } catch (err) {
    console.error("Erro ao carregar usuário logado:", err);
    return null;
  }
}

/**
 * Submit a guess for a group list sweepstake.
 */
export async function submitGuessAction(
  params: GuessGroupListFromPoolSweepstakeParam,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return {
        success: false,
        error: "Você precisa estar logado para palpitar.",
      };
    }

    await guessGroupListFromPoolSweepstake.execute(user.id, params);
    return { success: true };
  } catch (err: unknown) {
    console.error("Erro no submitGuessAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Falha ao enviar palpite.",
    };
  }
}
