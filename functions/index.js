import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getDatabase } from 'firebase-admin/database';
import { initializeApp } from 'firebase-admin/app';

// Initialize the Admin SDK
initializeApp();

// Schedule this function at 6 AM PST
export const dailyReset = onSchedule(
    {
        schedule: '0 6 * * *',          // "0 6 * * *" → 6:00 AM daily
        timeZone: 'America/Los_Angeles' // PST/PDT
    },
    async () => {
        const db = getDatabase();

        try {
        // 1. Fetch current ratings
        const ratingsSnap = await db.ref('ratings').once('value');
        const ratingsData = ratingsSnap.val();

        // 2. Find top-rated club
        if (ratingsData) {
            let topClub = null;
            let topAverage = -Infinity;

            Object.keys(ratingsData).forEach((clubName) => {
            const { total, count } = ratingsData[clubName] || {};
            if (count > 0) {
                const avg = total / count;
                if (avg > topAverage) {
                topAverage = avg;
                topClub = clubName;
                }
            }
            });

            // 3. Store in "topRating"
            if (topClub) {
            await db.ref('topRating').set({
                club: topClub,
                average: topAverage,
                timestamp: Date.now(),
            });
            }
        }

        // 4. Reset your other data
        await db.ref('ratings').set(null);
        await db.ref('checkIns').set(null);
        await db.ref('userLocations').set(null);

        console.log('Daily reset completed at 6 AM PST.');
        return null;
        } catch (error) {
        console.error('Error during daily reset:', error);
        throw error;
        }
    }
);