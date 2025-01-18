# Club Hoppr

**Club Hoppr** is a React application designed to let users rate and comment on popular clubs and bars in Downtown San Diego & Pacific Beach. It features:

- **Per-Club Ratings:** Users can choose a rating (1–10) for each club or bar.
- **Per-Club Comments:** Users can add comments specifically for each location.
- **Real-Time Updates:** Ratings and comments are synced live with Firebase.
- **Daily Reset:** The entire database of ratings and comments resets every day at 6:00 AM PST.

## Table of Contents

- [Features](#features)  
- [Demo](#demo)  
- [Tech Stack](#tech-stack)

---

## Features

1. **Real-Time Ratings & Comments:** Deployed on Firebase Realtime Database.  
2. **Conditional Styling for Ratings:**  
   - Average rating is green if ≥ 7.0 and red if < 5.0.  
   - A fire emoji next to each club’s name grows more opaque the higher the rating.  
3. **Daily Reset Mechanism:** Automatically clears all comments and ratings at 6:00 AM PST.  
4. **Tailwind CSS UI:** A sleek, dark-themed interface using Tailwind classes.  

---

## Demo

[Live Site](https://thomascaneday.github.io/club-hoppr/)

---

## Tech Stack

- **React** (Hooks, functional components)
- **Firebase** (Realtime Database)
- **Tailwind CSS** for styling
- **JavaScript** (ES6+)
