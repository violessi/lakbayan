import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "@contexts/SessionContext";
import { supabase } from "@utils/supabase";
import {
  fetchUserTransitJournal,
  fetchTransitJournal,
  fetchTrip,
  fetchSegments,
  insertLiveUpdate,
} from "@services/trip-service";

interface TransitJournalContextType {
  hasActiveTransitJournal: boolean;
  transitJournal: any | null;
  trip: Trip | null;
  segments: Segment[] | null;
  addLiveUpdate: (status: { type: LiveUpdateType; coordinate: Coordinates }) => Promise<void>;
}

const TransitJournalContext = createContext<TransitJournalContextType | null>(null);

export function TransitJournalProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  if (!user) return <>{children}</>;

  const [transitJournalId, setTransitJournalId] = useState<string | null>(null);
  const [transitJournal, setTransitJournal] = useState<any | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [hasActiveTransitJournal, setHasActiveTransitJournal] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const transitJournalId = await fetchUserTransitJournal(user?.id ?? "");
        setTransitJournalId(transitJournalId);
      } catch (error) {
        throw new Error("Error fetching transit journal ID");
      }
    };
    fetchInitialData();

    const subscription = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user?.id || ""}` },
        (payload: any) => {
          setTransitJournalId(payload.new.transit_journal_id);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id ?? ""]);

  useEffect(() => {
    if (!transitJournalId) {
      setTrip(null);
      setSegments(null);
      setTransitJournal(null);
      setHasActiveTransitJournal(false);
      return;
    }

    const fetchTransitJournalData = async () => {
      try {
        const journalData = await fetchTransitJournal(transitJournalId);
        const fullTripData = await fetchTrip(journalData.tripId);
        const { segments, ...trip } = fullTripData;

        if (journalData.preSegmentId) {
          const preSegment = await fetchSegments([journalData.preSegmentId]);
          segments.unshift(preSegment[0]);
        }
        if (journalData.postSegmentId) {
          const postSegment = await fetchSegments([journalData.postSegmentId]);
          segments.push(postSegment[0]);
        }

        setTrip(trip);
        setSegments(segments);
        setTransitJournal(journalData);
        setHasActiveTransitJournal(true);
      } catch (error) {
        console.error("Error fetching transit journal data:", error);
        setTrip(null);
        setSegments(null);
        setTransitJournal(null);
        setHasActiveTransitJournal(false);
      }
    };
    fetchTransitJournalData();
  }, [transitJournalId]);

  const addLiveUpdate = async (status: { type: LiveUpdateType; coordinate: Coordinates }) => {
    const payload: CreateLiveUpdate = {
      contributorId: user.id,
      transitJournalId: transitJournalId!,
      type: status.type,
      coordinate: status.coordinate,
    };

    try {
      await insertLiveUpdate(payload);
    } catch (error) {
      throw new Error("Error adding live status");
    }
  };

  const value = {
    trip,
    segments,
    transitJournal,
    hasActiveTransitJournal,
    addLiveUpdate,
  };
  return <TransitJournalContext.Provider value={value}>{children}</TransitJournalContext.Provider>;
}

export const useTransitJournal = (): TransitJournalContextType => {
  const context = React.useContext(TransitJournalContext);
  if (!context) {
    throw new Error("useTransitJournal must be used within a TransitJournalProvider");
  }
  return context;
};
