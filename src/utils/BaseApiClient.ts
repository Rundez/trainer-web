import { Client } from "../api-client";
import { supabase } from "../lib/supabase";

export class SupabaseHttpClient {
  async fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    // Get current session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    // Clone and set headers
    const headers = new Headers(init?.headers || {});
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, { ...init, headers });
  }
}

const httpClient = new SupabaseHttpClient();
export const apiClient = new Client("http://localhost:5226", httpClient);
