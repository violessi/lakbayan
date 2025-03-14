import { supabase } from "@utils/supabase";

export async function insertJournalEntry(
  segmentId: string,
  verifierId: string | null,
  timeStart: string,
  timeEnd: string | null,
  duration: number,
  reportedTraffic: boolean,
  reportedLines: boolean,
) {
  const { error } = await supabase.from("journal-entries").insert([
    {
      segment_id: segmentId,
      verifier_id: verifierId,
      time_start: timeStart,
      time_end: timeEnd,
      duration: duration,
      reported_traffic: reportedTraffic,
      reported_lines: reportedLines,
    },
  ]);

  if (error) {
    console.error("Error adding journal entry:", error);
    return false;
  }

  return true;
}
