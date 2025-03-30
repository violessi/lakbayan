import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "@contexts/SessionContext";
import { supabase } from "@utils/supabase";
import { fetchUserTransitJournal, fetchTransitJournal, fetchTrip } from "@services/trip-service-v2";

interface TransitJournalContextType {
  hasActiveTransitJournal: boolean;
  transitJournalData: any | null;
  trip: Trip | null;
  segments: Segment[] | null;
}

const TransitJournalContext = createContext<TransitJournalContextType | null>(null);

export function TransitJournalProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged");

  const [transitJournalId, setTransitJournalId] = useState<string | null>(null);
  const [transitJournalData, setTransitJournalData] = useState<any | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [segments, setSegments] = useState<Segment[] | null>(null);

  const hasActiveTransitJournal = !!transitJournalId;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const transitJournalId = await fetchUserTransitJournal(user.id);
        setTransitJournalId(transitJournalId);
      } catch (error) {
        throw new Error("Error fetching transit journal ID");
      }
    };

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

    fetchInitialData();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  useEffect(() => {
    console.log("Transit Journal ID!", transitJournalId);
    if (!transitJournalId) {
      setTrip(null);
      setSegments(null);
      setTransitJournalData(null);
      return;
    }

    const fetchTransitJournalData = async () => {
      try {
        const journalData = await fetchTransitJournal(transitJournalId);
        const fullTripData = await fetchTrip(journalData.tripId);
        const { segments, ...trip } = fullTripData;
        setTrip(trip);
        setSegments(segments);
        setTransitJournalData(journalData);
      } catch (error) {
        throw new Error("Error fetching transit journal data");
      }
    };

    fetchTransitJournalData();
  }, [transitJournalId]);

  const value = { hasActiveTransitJournal, transitJournalData, trip, segments };
  return <TransitJournalContext.Provider value={value}>{children}</TransitJournalContext.Provider>;
}

export const useTransitJournal = (): TransitJournalContextType => {
  const context = React.useContext(TransitJournalContext);
  if (!context) {
    throw new Error("useTransitJournal must be used within a TransitJournalProvider");
  }
  return context;
};
