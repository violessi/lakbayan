import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "@contexts/SessionContext";
import { supabase } from "@utils/supabase";

interface TransitJournalContextType {
  hasActiveTransitJournal: boolean;
  transitJournalData: any | null;
}

const TransitJournalContext = createContext<TransitJournalContextType | null>(null);

export function TransitJournalProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged");

  const [transitJournalId, setTransitJournalId] = useState<string | null>(null);
  const [hasActiveTransitJournal, setHasActiveTransitJournal] = useState<boolean>(false);
  const [transitJournalData, setTransitJournalData] = useState<any | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("transit_journal_id")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching transit journal ID:", error.message);
        return;
      }

      setTransitJournalId(data?.transit_journal_id ?? null);
      setHasActiveTransitJournal(!!data?.transit_journal_id);
    };

    fetchInitialData();

    const subscription = supabase
      .channel("profiles-transit-journal")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload: any) => {
          const newTransitJournalId = payload.new.transit_journal_id ?? null;
          setTransitJournalId(newTransitJournalId);
          setHasActiveTransitJournal(!!newTransitJournalId);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  useEffect(() => {
    if (!transitJournalId) {
      setTransitJournalData(null);
      return;
    }

    const fetchTransitJournalData = async () => {
      const { data, error } = await supabase
        .from("transit_journals")
        .select("*")
        .eq("id", transitJournalId)
        .single();

      if (error) {
        console.error("Error fetching transit journal data:", error.message);
        setTransitJournalData(null);
        return;
      }

      setTransitJournalData(data);
    };

    fetchTransitJournalData();
  }, [transitJournalId]);

  const value = { hasActiveTransitJournal, transitJournalData };

  return <TransitJournalContext.Provider value={value}>{children}</TransitJournalContext.Provider>;
}

export const useTransitJournalContext = (): TransitJournalContextType => {
  const context = React.useContext(TransitJournalContext);
  if (!context) {
    throw new Error("useTransitJournalContext must be used within a TransitJournalProvider");
  }
  return context;
};
