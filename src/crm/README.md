# SimpleCRM - Visual Sales Pipeline

A kanban-style visual interface for managing sales deals with drag-and-drop functionality.

## Features

### ✅ Kanban-Style Visual Interface
- Five-stage pipeline: Lead → Qualified → Proposal → Negotiation → Closed Won
- Clear visual representation of deals across stages
- Real-time statistics for each stage (deal count and total value)
- Overall pipeline value tracking

### ✅ Drag-and-Drop Functionality
- Intuitive drag-and-drop to move deals between stages
- Visual feedback during dragging (opacity change, hover effects)
- Drop zones highlight when dragging over them
- Automatic statistics update after deal movement

### Deal Cards Display
Each deal card shows:
- Deal title
- Company name
- Deal value (formatted with currency)
- Deal owner (assigned sales rep)
- Expected close date

### Add New Deals
- Modal form for creating new deals
- Required fields: title, company, value, owner, close date
- New deals automatically start in the "Lead" stage

## Getting Started

### Opening the Application

1. Navigate to the CRM directory:
   ```bash
   cd src/crm
   ```

2. Open the HTML file in a web browser:
   - **Using Python's HTTP server:**
     ```bash
     python3 -m http.server 8000
     ```
     Then visit: http://localhost:8000/sales-pipeline.html

   - **Or directly open the file:**
     ```bash
     open sales-pipeline.html  # macOS
     xdg-open sales-pipeline.html  # Linux
     start sales-pipeline.html  # Windows
     ```

### Using the Pipeline

1. **View Deals**: The pipeline loads with sample deals across different stages
2. **Move Deals**: Click and drag any deal card to a different stage
3. **Add New Deal**: Click the "+ Add New Deal" button and fill out the form
4. **Track Progress**: Watch the statistics update automatically as you move deals

## Technical Implementation

### Technology Stack
- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with flexbox, animations, and responsive design
- **Vanilla JavaScript**: Drag-and-drop using HTML5 Drag and Drop API
- **LocalStorage**: Persistence of deal data across sessions

### Files
- `sales-pipeline.html` - Main HTML structure
- `pipeline-styles.css` - Complete styling and responsive design
- `pipeline-app.js` - Business logic and drag-and-drop functionality

### Key Features Implementation

#### Drag-and-Drop
Uses the HTML5 Drag and Drop API with the following events:
- `dragstart` - Initialize drag operation
- `dragover` - Allow dropping
- `dragenter`/`dragleave` - Visual feedback
- `drop` - Handle the drop and update data
- `dragend` - Clean up

#### Data Persistence
- Deals are saved to browser's localStorage
- Data persists between sessions
- Sample data loads on first visit

#### Responsive Design
- Mobile-friendly layout
- Columns stack vertically on smaller screens
- Touch-friendly for mobile devices

## Sample Data

The application includes 5 sample deals:
1. Enterprise Software License - $50,000 (Lead)
2. Cloud Migration Project - $125,000 (Qualified)
3. Annual Support Contract - $35,000 (Proposal)
4. Custom Development - $85,000 (Negotiation)
5. Platform Integration - $45,000 (Closed Won)

Total pipeline value: $340,000

## Future Enhancements

Potential improvements for Phase 2:
- Deal editing and deletion
- Filtering and search functionality
- Deal details modal with full information
- User authentication and multi-user support
- Backend API integration
- Activity logging and history
- Export to CSV/Excel
- Custom pipeline stages
- Deal probability and weighted forecasting

## Acceptance Criteria Met

✅ **Implement a kanban-style visual interface for deals**
- Five-stage pipeline with clear visual separation
- Cards display key deal information
- Professional, modern design
- Statistics tracking per stage

✅ **Enable drag-and-drop functionality to move deals between stages**
- Full HTML5 drag-and-drop implementation
- Visual feedback during drag operations
- Smooth transitions and animations
- Data persistence after moves
- Real-time statistics updates

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript enabled and localStorage support.
