import type { Camera, Location } from "@rnmapbox/maps";
import { useContext, useRef, createContext, useState, ReactNode, useEffect, Fragment } from "react";

import { type LineSourceRef } from "@components/map/LineSource";
import { type CircleSourceRef } from "@components/map/CircleSource";

import {
  fetchTrip,
  fetchSegments,
  insertLiveUpdate,
  fetchTransitJournal,
  fetchUserTransitJournal,
} from "@services/trip-service";
import { subscribeToTableChanges } from "@api/supabase";

import {
  computeHeading,
  isNearLocation,
  getNearestSegment,
  getNearestStep,
} from "@utils/map-utils";
import { useSession } from "@contexts/SessionContext";

interface AddLiveUpdate {
  type: LiveUpdateType;
  coordinate: Coordinates;
}

interface TransitJournalContextType {
  cameraRef: React.RefObject<Camera>;
  lineRef: React.RefObject<LineSourceRef>;
  circleRef: React.RefObject<CircleSourceRef>;
  transitJournalId: string | null;
  transitJournal: any | null;
  trip: FullTrip | null;
  segments: Segment[] | null;
  currentStep: NavigationSteps | null;
  activeSegments: Segment[];
  loadingSegments: boolean;
  showTripAbortModal: boolean;
  showNextSegmentModal: boolean;
  showTripFinishedModal: boolean;
  rating: number | null;
  hasDeviated: boolean | null;
  setShowTripAbortModal: (showTripAbortModal: boolean) => void;
  setShowNextSegmentModal: (showNextSegmentModal: boolean) => void;
  setShowTripFinishedModal: (showTripFinishedModal: boolean) => void;
  setRating: (rating: number | null) => void;
  setHasDeviated: (hasDeviated: boolean | null) => void;
  addLiveUpdate: ({ type, coordinate }: AddLiveUpdate) => Promise<void>;
  handleUserLocationUpdate: ({ coords }: Location) => Promise<void>;
  followUser: boolean;
  setFollowUser: (followUser: boolean) => void;
}

const TransitJournalContext = createContext<TransitJournalContextType | null>(null);

export function TransitJournalProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const cameraRef = useRef<Camera>(null);
  const lineRef = useRef<LineSourceRef>(null);
  const circleRef = useRef<CircleSourceRef>(null);

  const [transitJournal, setTransitJournal] = useState<any | null>(null);
  const [transitJournalId, setTransitJournalId] = useState<string | null>(null);

  const [trip, setTrip] = useState<FullTrip | null>(null);
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [currentStep, setCurrentStep] = useState<NavigationSteps | null>(null);
  const [activeSegments, setActiveSegments] = useState<Segment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(true);

  const [rating, setRating] = useState<number | null>(null);
  const [hasDeviated, setHasDeviated] = useState<boolean | null>(false);

  const [showTripAbortModal, setShowTripAbortModal] = useState(false);
  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);
  const [showTripFinishedModal, setShowTripFinishedModal] = useState(false);
  const [followUser, setFollowUser] = useState(true);

  // Check if the user has a transit journal
  useEffect(() => {
    if (!user) return;
    const fetchInitialData = async () => {
      try {
        const transitJournalId = await fetchUserTransitJournal(user.id);
        setTransitJournalId(transitJournalId);
      } catch (error) {
        console.error("[ERROR] Failed to fetch user transit journal");
      }
    };
    fetchInitialData();

    const subscription = subscribeToTableChanges({
      table: "profiles",
      filters: { id: user.id },
      callback: (payload: any) => setTransitJournalId(payload.new.transit_journal_id),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Fetch the transit journal data
  useEffect(() => {
    setLoadingSegments(true);
    if (!transitJournalId) {
      setTrip(null);
      setSegments(null);
      setTransitJournal(null);
      return;
    }

    const fetchTransitJournalData = async () => {
      try {
        const journalData = await fetchTransitJournal(transitJournalId);
        const fullTripData = await fetchTrip(journalData.tripId);
        const { segments, ...res } = fullTripData;

        if (journalData.preSegmentId) {
          const preSegment = await fetchSegments([journalData.preSegmentId]);
          segments.unshift(preSegment[0]);
        }
        if (journalData.postSegmentId) {
          const postSegment = await fetchSegments([journalData.postSegmentId]);
          segments.push(postSegment[0]);
        }

        setTrip(fullTripData);
        setSegments(segments);
        setTransitJournal(journalData);
        setLoadingSegments(false);
      } catch (error) {
        console.error("Error fetching transit journal data:", error);
      }
    };
    fetchTransitJournalData();
  }, [transitJournalId]);

  // ============================ Methods ============================

  const addLiveUpdate = async ({ type, coordinate }: AddLiveUpdate) => {
    try {
      if (!transitJournalId || !user) return;
      const payload = { contributorId: user.id, transitJournalId, coordinate, type };
      await insertLiveUpdate(payload);
    } catch (error) {
      throw new Error("Error adding live status");
    }
  };

  const handleUserLocationUpdate = async ({ coords }: Location) => {
    if (!segments || !lineRef.current || !circleRef.current || !cameraRef.current) return;
    const newLocation = [coords.longitude, coords.latitude] as Coordinates;

    // get the current segment and step, and the active routes
    const { segmentIndex, nearestPoint } = getNearestSegment(newLocation, segments);
    const _currentSegment = segments[segmentIndex];
    const activeRoutes = getActiveRoutes(segments, segmentIndex, nearestPoint);
    const { stepIndex } = getNearestStep(newLocation, _currentSegment.navigationSteps);

    // update the camera to follow the user and face the next point
    // TODO: add toggle follow mode
    if (followUser) {
      const newHeading = computeHeading(newLocation, activeRoutes[0].waypoints[1] ?? newLocation);
      cameraRef.current.setCamera({
        pitch: 60,
        zoomLevel: 16,
        animationDuration: 1000,
        heading: newHeading,
        centerCoordinate: newLocation,
      });
    }

    // update the map with the new segments
    lineRef.current.update(activeRoutes);
    circleRef.current.update(activeRoutes);

    // Show transfer modal everytime segment changes
    if (activeSegments[0]?.id !== _currentSegment.id) {
      setShowTripFinishedModal(false);
      setShowNextSegmentModal(true);
    }

    // check if currentLocation is near destination
    const destination = segments[segments.length - 1].endCoords;
    if (isNearLocation(newLocation, destination, 20)) {
      setShowNextSegmentModal(false);
      setShowTripFinishedModal(true);
    }

    // update the active segments and step information
    setActiveSegments(segments.slice(segmentIndex));
    setCurrentStep(_currentSegment.navigationSteps[stepIndex]);
  };

  const value = {
    cameraRef,
    lineRef,
    circleRef,
    transitJournal,
    transitJournalId,
    trip,
    segments,
    rating,
    hasDeviated,
    loadingSegments,
    currentStep,
    activeSegments,
    addLiveUpdate,
    showTripAbortModal,
    setShowTripAbortModal,
    showNextSegmentModal,
    setShowNextSegmentModal,
    showTripFinishedModal,
    setShowTripFinishedModal,
    handleUserLocationUpdate,
    followUser,
    setFollowUser,
    setRating,
    setHasDeviated,
  };

  if (!user) return <Fragment>{children}</Fragment>;
  return <TransitJournalContext.Provider value={value}>{children}</TransitJournalContext.Provider>;
}

export const useTransitJournal = (): TransitJournalContextType => {
  const context = useContext(TransitJournalContext);
  if (!context) {
    throw new Error("useTransitJournal must be used within a TransitJournalProvider");
  }
  return context;
};

function getActiveRoutes(segments: Segment[], currentIndex: number, nearestPoint: NearestPoint) {
  const segmentsCopy = JSON.parse(JSON.stringify(segments)) as Segment[];
  const activeSegments = segmentsCopy.slice(currentIndex);
  activeSegments[0].waypoints = [
    nearestPoint.geometry.coordinates as Coordinates,
    ...activeSegments[0].waypoints.slice(nearestPoint.properties.index + 1),
  ];
  return activeSegments;
}
