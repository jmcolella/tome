# Goal Metrics & Encouraging Copy Ideas

## 🎯 Fun Progress Metrics

### Pace & Velocity
- **Pages/Books per day** - Current reading speed
- **Required daily pace** - What's needed to hit the target by end date (vs actual pace)
- **Projection date** - "At current pace, you'll finish on X date"
- **Pace acceleration** - Is reading velocity increasing week-over-week?

### Time-based
- **Progress as % of goal** - Simple visual progress bar
- **Days remaining vs days elapsed** - Urgency indicator
- **Reading streaks** - Consecutive days with logged activity
- **Time saved/lost** - Days ahead or behind the ideal pacing curve

### Milestone achievements
- **Books/pages completed since goal start** - Cumulative wins
- **Largest single reading session** - Peak engagement moment
- **Days until next milestone** (25%, 50%, 75% done)

---

## ⚠️ Off-Track Indicators

### Stalled Activity
- **Days since last log** - Red flag at >5 days
- **Zero activity in last week** - Complete reading gap
- **Declining activity pattern** - Pages per week trending down

### Pacing Problems
- **Behind pace threshold** - If actual progress < required pace to hit target
- **Days behind schedule** - How far off the ideal curve
- **Dropout risk score** - Combines days inactive + pace gap + time remaining

---

## 💡 Encouraging Copy Examples

### When on track
- "🔥 You're reading **1.5x faster** than needed to hit your goal!"
- "You've read **127 pages this week**—that's 18 pages/day!"
- "On pace! You'll finish **3 days early**."

### When off-track (gentle nudges)
- "It's been **6 days**. Your book is waiting! 📖"
- "You need **8 pages/day** to stay on track. You're currently at 4. Let's catch up!"
- "Behind by **2 days** of pace. No pressure—let's get back into it this week."
- "Small gap forming: You're at **35%** but should be at **42%** by now. You've got time!"

### Motivational
- "Only **22 pages** until your next milestone! You can do it today."
- "Your longest reading stretch was **148 pages**. Ready to beat it?"
- "You have **28 days left** to finish. That's totally doable!"

---

## 📊 Data Model Enhancement Idea

Optional **GoalProgress** table to avoid recalculating on every request:
```
GoalProgress {
  goalId
  date (for daily snapshots)
  pagesRead (cumulative)
  booksCompleted (count)
  lastActivityDate
  pacePerDay
  projectedCompletionDate
  isOnTrack (boolean)
}
```

This would let you trend metrics over time and generate more sophisticated insights.
