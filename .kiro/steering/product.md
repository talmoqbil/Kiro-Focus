# Nimbus - Product Overview

Nimbus is a gamified focus timer application that rewards users with "Cloud Credits" for completing timed focus sessions. Users spend credits to purchase AWS-style cloud infrastructure components and arrange them on a visual canvas.

## Core Features

- Focus timer with preset durations (15, 25, 45, 60, 90 minutes)
- Cloud Credits earned based on session completion, streaks, and bonuses
- Component Shop for purchasing AWS-style infrastructure (EC2, S3, RDS, etc.)
- Infrastructure Canvas for arranging purchased components
- Session history tracking with statistics
- Kiro ghost mascot that displays messages and reacts to user actions
- Two AI agents: Focus Coach (motivation) and Cloud Architect (education)

## Target Audience

Computer science students, junior developers, and tech professionals who need focus tools and want to learn cloud concepts engagingly.

## Key Constraints

- No localStorage/sessionStorage - data persistence via JSON export/import only
- Dark spectral theme with purple accent (#b794f6)
- Timer must remain accurate even when browser tab is inactive
