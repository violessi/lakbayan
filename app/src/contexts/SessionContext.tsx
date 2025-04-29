import { createContext, useContext, useState, useEffect, ReactNode, Fragment } from "react";

import { supabase } from "@utils/supabase";
import { User } from "@supabase/supabase-js";

interface SessionContextType {
  user: User | null;
  username: string | null;
  setUsername: (newUsername: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function handleUserSession(sessionUser: User | null) {
    setUser(sessionUser);

    if (sessionUser) {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", sessionUser.id)
        .single();
      setUsername(data?.username ?? null);
    } else {
      setUsername(null);
    }
  }

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await handleUserSession(session?.user ?? null);
      setLoading(false);
    }

    initSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleUserSession(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ user, username, setUsername }}>
      {loading ? <Fragment /> : children}
    </SessionContext.Provider>
  );
}

// Custom hook to use session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
