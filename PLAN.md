Project Plan: Ben Lairig Mountaineering Competency Tracker

1. Project Overview

A professional competency tracking platform for Ben Lairig Mountaineering. The app allows members to track technical skills and request verification from the committee, while providing an administrative interface for committee members to manage the club's skill database.

Primary Goal: Track member skills/competencies for training and mountain practice.

Target Audience: Club members (verification requests) and Committee (admin verification).

Deployment: GitHub Pages.

Environment: Vite + React (Dynamic, auto-sizing block-based architecture).

2. Technical Stack & Data

Frontend: React with Tailwind CSS.

Authentication: Firebase Auth.

Member Domain: Restricted to @york.ac.uk emails.

Admin Account: Specifically reserved for benlairig@yorksu.org.

Storage: SQLite (.db file) for structured competency data and user states.

Icons: Lucide-React (Minimalist, consistent, professional).

No Emojis / No Gradients: Design must be flat, high-contrast, and minimalist.

3. Data Schema & Competency List

Competency Categories & Skills

Level 1: Skills required to scramble

Comfortable on grade 1 terrain.

Level 2: Skills required to top rope climb

Put on a harness correctly, without any twists.

Tie in with a figure of 8 and stopper knot.

Set up belay plate in the correct orientation, and tighten locking carabiner.

Top rope belay with one hand on the dead end of the rope and the rope always engaged with the belay plate.

Lowering correctly with 2 hands on the dead end of the rope.

Level 3: Skills required to lead climb

Lead belay - keeping the correct amount of slack in the rope at all times.

Clip in - correctly avoid backclipping and z-clipping.

Level 4: Skills required to second a trad climb

Take out protection, including using a nutkey correctly.

Tie a clove hitch.

Level 5: Skills required to lead a trad climb

Place nuts and hexes - rating a placement from 1 - 5.

Place Cams.

Extend pieces to maintain the line of the rope.

Build an anchor - equalised using IDEA.

Belay from anchor, ideally with knowledge of how to use guide mode.

Other Skills

First Aid Qualified.

Basic Winter Skills.

Advanced Winter Skills.

Technical Winter Skills.

4. Design & Interaction Specifications

Typography: * Primary Font: Montserrat (Bold for headers, Regular/Medium for body).

Style: High-tracking (letter spacing) for headers to match the branding.

Color Palette:

Background: White (#FFFFFF).

Text: Black (#000000).

Accent/Buttons/Active States: Yellow (#FFC107).

Interaction & UI:

Block-Based Layout: Each competency category is a distinct white block with a 1px black border.

Animations: * Smooth scroll transitions between sections.

Subtle hover effects: Interactive blocks shift 2px up with a crisp 4px offset shadow (no blur).

Fade-in entry for list items using a stagger effect.

Responsiveness: Fluid layout. Mobile-first design with increased touch targets.

5. Functional Requirements

Authentication

Standard Users: Sign up/Login restricted to @york.ac.uk emails.

Administrative User: benlairig@yorksu.org is automatically assigned the Admin role upon login.

Role-based redirection logic: Member View vs. Committee View.

Member View (Dashboard)

List of competencies organized by level.

Status tracking: Not Started, Pending Verification, Completed.

"Request Verification" button for each skill (non-linear progression supported).

Committee View (Admin)

Global dashboard showing all members.

"Action Required" queue for pending verification requests.

Verification controls: Single-click "Approve" or "Deny".

Search functionality to filter members by name or email.

6. Development Workflow (Antigravity)

Initialize Vite React project with Tailwind and Montserrat font.

Configure Firebase Auth with the specified email domain and admin email logic.

Setup SQLite database structure.

Build the responsive "Block-based" UI components.

Implement the member-to-admin verification request cycle.

Conduct final visual audit to remove any forbidden gradients or emojis.