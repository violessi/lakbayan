import React, { createContext, useContext, useEffect, useState } from "react";
import Mapbox from "@rnmapbox/maps";
import { supabase, supabaseUrl } from "@utils/supabase";

// Global cache
let mapboxTokenGlobal: string | null = null;
export const getCurrentMapboxToken = () => mapboxTokenGlobal;

const MapboxTokenContext = createContext<string | null>(null);

export const MapboxTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch a token from Supabase edge function on mount
    const fetchAndStore = async () => {
      console.log("[MapboxTokenProvider] Fetching Mapbox key…");
      try {
        const session = await supabase.auth.getSession();
        const jwt = session.data.session?.access_token;

        const res = await fetch(`${supabaseUrl}/functions/v1/get-mapbox-key`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const { key } = await res.json();

        if (key) {
          console.log("[MapboxTokenProvider] Key fetched ✓");
          Mapbox.setAccessToken(key);
          mapboxTokenGlobal = key;
          setToken(key);
        } else {
          console.warn("[MapboxTokenProvider] Received null key from Supabase");
        }
      } catch (err) {
        console.error("[MapboxTokenProvider] Failed to fetch key:", err);
      }
    };

    fetchAndStore();

    // Re‑attempt whenever auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchAndStore();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!token) return null;

  return <MapboxTokenContext.Provider value={token}>{children}</MapboxTokenContext.Provider>;
};

export const useMapboxToken = () => useContext(MapboxTokenContext);
