# UI/UX Specification

## Visual direction
Professional modern SaaS interface. Avoid copying Google Meet, Zoom, Teams, or other products.

Use:
- Clean typography
- Strong contrast
- Clear hierarchy
- Rounded cards
- Responsive grid
- Subtle animations
- Accessible controls

## Pages

### Landing
- Hero
- Features
- How it works
- Security
- CTA
- Footer

### Login
- Email
- Password
- Login
- Link to register
- Error state

### Register
- Name
- Email
- Password
- Confirm password
- Register

### Dashboard
- Create meeting
- Join meeting
- Recent meetings
- Profile/logout

### Meeting room
Main area:
- Video grid
- Shared screen area

Side panel:
- Chat
- Participants
- Files

Overlay/bottom controls:
- Mic
- Camera
- Screen share
- Chat
- Whiteboard
- Leave

## States
Every important component must have:
- Loading
- Empty
- Error
- Success
- Disabled
states where appropriate.

## Responsive behavior
Desktop:
- Video grid + side panel

Tablet:
- Flexible video grid
- Collapsible side panel

Mobile:
- One/two video tiles
- Bottom controls
- Panels as drawers/modals

## Accessibility
- Keyboard-accessible controls
- aria-label for icon-only buttons
- Visible focus states
- Color contrast
- Don't rely only on color for status
