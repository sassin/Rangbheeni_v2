import { fetchJson } from "@/lib/api";
import AnnouncementClient, {
  type LaunchAnnouncement,
} from "./AnnouncementClient";

const announcementEnabled =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT_ENABLED !== "false";

async function getServerAnnouncement(): Promise<LaunchAnnouncement | null> {
  if (!announcementEnabled) return null;

  try {
    return await fetchJson<LaunchAnnouncement | null>(
      "/public/announcement/active",
      {
        next: { revalidate: 300 },
      }
    );
  } catch {
    return null;
  }
}

export async function Announcement() {
  if (!announcementEnabled) return null;

  const announcement = await getServerAnnouncement();

  return (
    <AnnouncementClient
      enabled={announcementEnabled}
      initialAnnouncement={announcement}
    />
  );
}

export default Announcement;
