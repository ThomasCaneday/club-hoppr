import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase.js';   // keep your path
import dayjs from 'dayjs';

export default function MarqueeBar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const q = query(
      collection(firestore, 'events'),
      where('startTime', '>=', Date.now())   // unchanged
    );

    return onSnapshot(q, snap =>
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  if (!events.length) return null;

  /* ---------- visual wrapper (NEW) ---------- */
  return (
    <div className="w-screen bg-black">
      <Marquee
        pauseOnHover
        gradient={false}
        className="text-yellow-300 text-sm py-1"
      >
        {events.map(e => (
          <span key={e.id} className="mx-4 whitespace-nowrap">
            <a href={e.url ?? '#'} target="_blank" rel="noreferrer">
              {e.title} @ {e.club} — {dayjs(e.startTime).format('h:mm A')}
            </a>
          </span>
        ))}
      </Marquee>
    </div>
  );
}