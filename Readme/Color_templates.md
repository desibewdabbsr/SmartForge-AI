precise single color values and Vedic-inspired design:

🎨 Color Palette (Finalized)
Element
Usage Description
Color Code
Main Accent/Highlight
For titles, icons, borders, and key elements
#FFD700 (Gold)
Primary Buttons
Main call-to-action buttons (e.g., "Run", "Deploy")
#FF6F00 (Saffron)
Primary Button Hover
On hover or focus
#FF8800 (Brighter Saffron)
Secondary Buttons
Less priority buttons (e.g., "Cancel", "View Logs")
#444444 (Charcoal Grey)
Secondary Button Text
Text for secondary buttons
#FFD700 (Gold)
Text or Icon Glow
Subtle glow around icons/text (for hover effects)
#FFDA6B (Soft Golden Glow)
Sidebar/Background
Base layout background
#1B1B1B (Deep Charcoal)
Dashboard Borders / Table Columns
Divider lines, table grid lines, section borders
#FFD700
Active/Selected State
Tab active states, hover indicator bars
#FF6F00 (Same as primary)

🧱 Button Structure
🔹 Primary Button CSS
css

.button-primary {
  background-color: #FF6F00;
  color: white;
  border: 2px solid #FFD700;
  border-radius: 8px;
  font-family: 'Manrope', sans-serif;
  padding: 10px 16px;
  transition: 0.3s ease;
}

.button-primary:hover {
  background-color: #FF8800;
  box-shadow: 0 0 10px #FFDA6B;
}
🔸 Secondary Button CSS
css

.button-secondary {
  background-color: #444444;
  color: #FFD700;
  border: 1px solid #FFD700;
  border-radius: 6px;
  font-family: 'Manrope', sans-serif;
  padding: 8px 14px;
  transition: 0.3s ease;
}

.button-secondary:hover {
  background-color: #2E2E2E;
  box-shadow: 0 0 6px #FFD700;
}

✨ Fonts
Use dotmatrix font.


📐 UI Structure Tips
    • Use gold borders (#FFD700) for cards, tables, and containers.
    • Add saffron glow (#FF6F00) on hover/active states of inputs or tabs.
    • Icons in SVG or web fonts can have gold fills and subtle hover glows.
    • Use dark backgrounds to emphasize contrast (avoid pure black; use #1B1B1B).

