"use client";

import { useEffect, useState } from "react";
import type { AnnouncementDto } from "@rangbheeni/shared-types";

const contentApiUrl = process.env.NEXT_PUBLIC_CONTENT_API_URL || "http://localhost:4000";

export function Announcement() {
  const [announcement, setAnnouncement] = useState<AnnouncementDto | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch(`${contentApiUrl.replace(/\/$/, "")}/public/announcement/active`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: AnnouncementDto | null) => {
        if (!data || ignore) return;
        const key = `rangbheeni_announcement_dismissed_${data.id}`;
        if (window.localStorage.getItem(key) !== "true") setAnnouncement(data);
      })
      .catch(() => undefined);
    return () => { ignore = true; };
  }, []);

  if (!announcement) return null;
  const close = () => {
    window.localStorage.setItem(`rangbheeni_announcement_dismissed_${announcement.id}`, "true");
    setAnnouncement(null);
  };

  return (
    <div className="announcement" role="dialog" aria-modal="true" aria-labelledby="announcement-title">
      <div className="announcement-card">
        <button className="announcement-close" aria-label="Close announcement" onClick={close}>×</button>
        <p className="eyebrow">Rangbheeni update</p>
        <h2 id="announcement-title">{announcement.title}</h2>
        <p className="rich-text">{announcement.message}</p>
        {announcement.ctaUrl && announcement.ctaLabel ? <a className="button primary" href={announcement.ctaUrl} onClick={close}>{announcement.ctaLabel}</a> : null}
      </div>
    </div>
  );
}
