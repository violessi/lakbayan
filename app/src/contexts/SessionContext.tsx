import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { router } from "expo-router";

interface SessionContextType {
  userId: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        router.replace("/(tabs)");
      } else {
        setUserId(null);
        router.push("/(auth)/log-in");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={{ userId }}>{children}</SessionContext.Provider>;
};

// Custom hook to use session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
