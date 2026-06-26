# Workout Tracker (A/B System)   The Golden Era Physique App

## Overview
A minimalist workout tracking application with a vintage "Golden Era" aesthetic that guides users through two distinct workout sessions based on their experience level. All weights are displayed and entered in kilograms (kg). Each workout includes structured warm-up and cool-down phases with customizable activities and timer functionality. The application features a dark theme implementation using the Classic Newsprint & Iron dark palette. Users can edit previously logged workout sessions from the history view and access a dedicated Workout Log page for comprehensive workout review. During active workout sessions, users can navigate back to previous exercises to review or edit their inputs before saving the workout.

## User Experience Levels
- **Beginner** (< 6 months): Access only to Session A
- **Intermediate** (6+ months): Access to both Session A and Session B

## Workout Sessions

### Session A (Always Available)
1. Squat - 5 sets of 6 reps (main lift)
2. Bench Press - 5 sets of 6 reps (main lift)
3. Wide Pull Up - 3 sets of 6 reps
4. Behind The Neck Press - 3 sets of 6 reps
5. Pendlay Row - 3 sets of 6 reps
6. Sit Up - 3 sets of 10 reps

### Session B (Unlocks after 6 months)
1. Deadlift - 5 sets of 6 reps (main lift)
2. Incline Bench - 5 sets of 6 reps (main lift)
3. Wide Pull Up - 3 sets of 6 reps
4. Dips - 3 sets of 6 reps
5. Pendlay Row - 3 sets of 6 reps
6. Sit Up - 3 sets of 10 reps

## Core Features

### Navigation
- Header navigation with access to main workout tracker and dedicated "Logbook" page
- Consistent navigation styling with dark theme elements

### Workout Log Page
- Dedicated "Logbook" page displaying comprehensive workout history
- Vintage notebook-style layout consistent with Classic Newsprint & Iron aesthetic
- Chronological listing of past workouts with expandable sections
- Each workout entry displays:
  - Date, session type (A or B), and cycle phase
  - Warm-up activities with duration in minutes
  - Complete exercise details: name, sets, reps, weights, and technique cues
  - Cool-down activities with duration in minutes
- "Edit" button for each logged session that opens the workout in existing edit mode
- Elegant typography using Playfair Display for titles and Roboto Mono for details
- Dark vintage aesthetic maintained throughout the log interface

### Session Selection
- User selects today's workout session (A or B based on availability)
- Clear indication of locked/unlocked sessions

### Warm-Up & Stretch Phase
- Pre-workout section displayed before main exercises
- Users can add multiple custom warm-up/stretch activities
- Each activity allows setting custom duration in minutes
- Start/stop countdown timer functionality for each activity
- Timer displays remaining time with visual countdown
- Timers persist during workout session but reset when session is saved
- Newspaper-style header "Warm-Up & Stretch" with subtle separator

### Exercise Tracking with Navigation
- Input fields for weight (in kg) and reps for each set
- Display "Last: X kg" above each set input field based on previous set-specific data
- Main lifts (exercises 1 & 2): Progressive weight increase prompts between sets
- Supplemental lifts (exercises 3-6): Constant weight across all sets
- All weight values consistently displayed in kilograms
- Automatic pre-population of set input fields with last-used set-specific weights
- **Exercise Navigation**: Back and next navigation buttons between exercises during active workout sessions
- **Alternative Navigation**: Expandable list view allowing direct access to any previously logged exercise
- **Warm-Up Navigation**: "Go to Warm-Up" button or link in the exercise navigation controls near the previous/next buttons
- **Data Preservation**: All entered data remains preserved when navigating between exercises and when returning to warm-up
- **Seamless Updates**: Modifications to previous exercises seamlessly update the ongoing workout state
- **Vintage Flipbook Style**: Navigation styled to resemble a vintage workout log flipbook with dark theme elements

### Enhanced Exercise Display with Expandable Card Layout
- Each exercise displayed in a clean, expandable card layout with distinct separation
- Exercise name prominently displayed using serif typography (Playfair Display)
- Exercise icon displayed prominently beside the exercise name
- Exercise description and video link immediately visible with minimal interaction (hover or click reveal)
- Optional "Technique Focus" mini-section displayed like handwritten notes beneath exercise name
- Exercise-specific cues (e.g., "Do not lock out", "Parallel only") styled as technique notes
- Video player area with thumbnail or play icon styled in burnished gold
- Exercise icons contextually chosen from available assets (barbell-icon-transparent.dim_64x64.png, dumbbell-icon-transparent.dim_64x64.png)
- Styling matches Classic Newsprint & Iron dark theme with golden accents

### Cool-Down & Recovery Phase
- Post-workout section displayed after main exercises
- Users can add custom cool-down/stretch activities or notes
- Each activity allows setting custom time durations in minutes
- Track completion status for each cool-down activity
- Newspaper-style header "Cool-Down & Recovery" with subtle separator

### Set-Specific Weight Tracking
- Each individual set within an exercise remembers its own last-used weight
- Display last-used weight above each corresponding set input field
- Show "—" when no prior record exists for a specific set
- Pre-populate input fields with last set-specific values for continuity

### Workout History Editing
- "Edit Workout" button available for each logged workout session in the history view and Logbook page
- Clicking "Edit Workout" opens the existing WorkoutTracker layout pre-filled with saved data
- All workout components are editable: warm-up activities, exercise sets/reps/weights, cool-down activities
- Automatic recalculation of workout statistics when data is modified
- Confirmation dialog before saving edits to prevent accidental overwrites
- Edited workouts maintain their original date and session type
- Navigation back to history view or Logbook page after successful edit completion

### Technique Cues
- Always visible static reminders:
  - "Do Not Lock Out"
  - "Maintain Time Under Tension"
- Exercise-specific cues displayed within technique focus sections for each exercise

### Smooth Phase Transitions
- Gentle fade animations or slide transitions between warm-up, exercise, and cool-down phases
- Transitions evoke analog page flips while maintaining minimal distractions
- Smooth visual flow preserving vintage tactile feeling

## Visual Design - Classic Newsprint & Iron Dark Theme

### Color Palette (Dark Theme)
- **Background**: Matte Black (#121212)
- **Text**: Silver Grey (#E0E0E0)
- **Accent**: Burnished Gold (#C5A059) used for buttons, highlights, timer elements, video play icons, and navigation controls
- **Secondary elements**: Dark Slate Grey (#4A5568)
- **Description text**: Subtle silver text for exercise descriptions

### Typography
- **Headings and titles** (exercise names, Logbook titles): Playfair Display or Merriweather (serif)
- **Body text and numeric fields** (reps, weight, Logbook details): Roboto Mono or Inter (monospaced variant)
- **Exercise descriptions**: Subtle silver text using Roboto Mono
- **Technique focus notes**: Handwritten-style appearance beneath exercise names

### UI Elements
- Expandable card layout for each exercise with clean separation
- Vintage notebook-style layout for Logbook page with expandable workout sections
- Black-and-white exercise images in high-contrast, paper-like style adapted for dark theme
- Rectangular buttons with sharp edges or slight (2px) radius corners in dark styling
- Accent color marks active/completed sets, "Start Workout" actions, active timers, and navigation controls
- Minimalist layout with appropriate contrast and vintage "typewriter" feel for dark mode
- Newspaper-style section headers for warm-up and cool-down phases with dark theme styling
- Subtle separators between workout phases optimized for dark backgrounds
- Exercise icons displayed with golden accent coloring to match theme
- Video player areas styled with dark theme borders and burnished gold play icons
- Gentle visual hierarchy with prominent exercise names and subtle descriptions
- Smooth transitions and animations maintaining vintage aesthetic
- Edit workout confirmation dialogs styled with dark theme elements
- Navigation header styled with dark theme elements and golden accents
- **Exercise Navigation Controls**: Back/next buttons and expandable exercise list styled with vintage flipbook aesthetic and dark theme elements
- **Warm-Up Navigation Control**: "Go to Warm-Up" button styled with burnished gold accent and dark theme elements

### Graph Styling
- Conditioning/loading/recovery progress graph rendered in hand-drawn sketch style
- Roughened edges and graph-paper background aesthetic adapted for dark theme

### Implementation
- Consistent dark theme styling through Tailwind theme variables
- Custom CSS adjustments in index.css and tailwind.config.js for dark mode
- Applied across all core screens: Workout Tracker, Session Selector, Profile Setup Modal, Workout History, Logbook
- All visual elements (buttons, cards, headers, inputs, navigation controls) styled for dark theme readability
- Full responsiveness maintained across all screen sizes
- Expandable card animations and transitions implemented with CSS/JavaScript

## Backend Data Storage

### User Profile
- Experience level and start date
- Unlocked sessions based on experience duration
- User progression tracking

### Exercise Data
- Exercise definitions including name, sets, reps, and exercise type
- Exercise descriptions with correct execution and movement philosophy text
- Optional video URLs for exercise demonstrations (YouTube/Vimeo links)
- Icon associations for each exercise using correct file paths (barbell-icon-transparent.dim_64x64.png or dumbbell-icon-transparent.dim_64x64.png)
- Technique focus cues for each exercise

### Workout History
- Complete workout sessions with date and session type
- Exercise logs with sets, reps, and weights (in kg) for each exercise
- Warm-up activities with names, durations in minutes, and completion status
- Cool-down activities with names, durations in minutes, and completion status
- Historical progression data
- Legacy data conversion support for second-based durations to minutes
- Workout update functionality to modify existing workout sessions
- Workout retrieval by unique identifier for editing purposes

### Set-Specific Weight Data
- Store structure mapping each exercise to an array of last-used weights per set
- Data format: exercise name, set index, and weight for each individual set
- Enable retrieval of set-specific weight history for each exercise
- Update functions to record each set's exact weight used after workout completion
- Maintain set-level granularity for accurate weight tracking and display

### Duration Data Management
- Store all warm-up and cool-down activity durations in minutes
- Backend conversion logic to handle legacy second-based data if present
- Ensure all new duration entries are stored in minutes format

## User Interface Requirements
- Header navigation with access to main workout tracker and "Logbook" page
- Dedicated Workout Log page with vintage notebook-style layout and dark theme styling
- Chronological workout listing with expandable sections showing complete workout details
- Session selection screen with dark theme styling
- Warm-up & stretch interface with custom activity input and timer functionality (minutes-based)
- Enhanced exercise tracking interface with expandable card layout in dark theme
- **Exercise Navigation Interface**: Back and next navigation buttons between exercises styled with vintage flipbook aesthetic
- **Alternative Exercise Access**: Expandable list view for direct access to any previously logged exercise during active workout
- **Warm-Up Return Navigation**: "Go to Warm-Up" button or link positioned near the previous/next buttons in exercise navigation controls
- **Data State Management**: Preservation of all entered data when navigating between exercises and when returning to warm-up during active workout sessions
- Expandable exercise cards with prominent exercise names using Playfair Display typography
- Exercise descriptions and video links with minimal-click access (hover or click reveal)
- Technique Focus mini-sections styled as handwritten notes beneath exercise names
- Exercise icons prominently displayed using correct file paths: /assets/generated/barbell-icon-transparent.dim_64x64.png and /assets/generated/dumbbell-icon-transparent.dim_64x64.png
- Video player areas with burnished gold thumbnails or play icons
- Smooth fade or slide transitions between workout phases including warm-up return navigation
- Cool-down & recovery interface with custom activity input and duration tracking (minutes-based)
- Display of "Last: X kg" above each set input field with set-specific data
- Automatic pre-population of set input fields with last set-specific weights
- Graceful handling of missing data (display "—" for sets without prior records)
- Always-visible technique reminder toggles styled for dark theme
- Exercise-specific cue display within technique focus sections
- Progress indication within workout using dark theme styling
- Workout completion confirmation with dark theme elements
- Workout history display including warm-up and cool-down logs (durations in minutes)
- "Edit Workout" buttons in workout history view and Logbook page styled with dark theme
- Editable workout interface reusing existing WorkoutTracker layout with pre-filled data
- Confirmation dialog for saving workout edits with dark theme styling
- Navigation between history view, Logbook page, and edit mode maintaining smooth transitions
- Consistent kilogram unit display throughout the application
- Duration input labels and displays clearly indicating minutes as the unit
- Timer functionality operating in minutes with appropriate countdown display
- Golden era logo integration using golden-era-logo.png asset
- Full responsiveness maintained across all device sizes
- Gentle visual hierarchy with subtle silver description text and burnished gold accents
- English language content throughout the application
