import React, { createContext, useContext, useState, useEffect } from "react";

import { supabase } from "@utils/supabase";
import { User } from "@supabase/supabase-js";

interface SessionContextType {
  user: User | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={{ user }}>{loading ? <></> : children}</SessionContext.Provider>;
};

// Custom hook to use session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
