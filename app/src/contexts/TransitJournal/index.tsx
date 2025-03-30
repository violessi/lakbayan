import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "@contexts/SessionContext";
import { supabase } from "@utils/supabase";
import { ProfileSchema } from "types/schema";

interface TransitJournalContextType {
  transitJournalData: any | null;
}

const TransitJournalContext = createContext<TransitJournalContextType | null>(null);

export function TransitJournalProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged");

  const [transitJournalId, setTransitJournalId] = useState<string | null>(null);
  const [transitJournalData, setTransitJournalData] = useState<any | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("transit_journal_id")
        .eq("id", user.id)
        .single();

      if (error) throw new Error("Error fetching transit journal id: " + error.message);
      setTransitJournalId(data.transit_journal_id ?? null);
    };

    fetchInitialData();

    const subscription = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload: any) => {
          setTransitJournalId(payload.new.transit_journal_id ?? null);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  useEffect(() => {
    console.log("Transit Journal ID!", transitJournalId);
    if (!transitJournalId) {
      setTransitJournalData(null);
      return;
    }

    const fetchTransitJournalData = async () => {
      const { data, error } = await supabase
        .from("transit_journal_v2")
        .select("*")
        .eq("id", transitJournalId)
        .single();

      if (error) throw new Error("Error fetching transit journal data: " + error.message);
      setTransitJournalData(data);
    };

    fetchTransitJournalData();
  }, [transitJournalId]);

  const value = { transitJournalData };

  return <TransitJournalContext.Provider value={value}>{children}</TransitJournalContext.Provider>;
}

export const useTransitJournalContext = (): TransitJournalContextType => {
  const context = React.useContext(TransitJournalContext);
  if (!context) {
    throw new Error("useTransitJournalContext must be used within a TransitJournalProvider");
  }
  return context;
};
