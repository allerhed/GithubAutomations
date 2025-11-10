# SimpleCRM Lead Capture Module

This module implements lead generation and qualification from website forms and chat widgets for the SimpleCRM system.

## Features

✅ **Web Form Widget** - Embeddable HTML form for capturing leads from website  
✅ **Chat Widget** - Conversational interface for lead capture  
✅ **Automatic Lead Assignment** - Rule-based assignment to sales reps  
✅ **CRM Pipeline Integration** - Automatic feeding of leads into CRM pipeline  
✅ **Flexible Configuration** - Customizable fields, styling, and rules  

## Installation

```typescript
import { LeadCaptureService, LeadAssignmentEngine, LeadCaptureForm, LeadCaptureChat } from './crm';
```

## Quick Start

### 1. Web Form Widget

```html
<!DOCTYPE html>
<html>
<head>
    <title>Lead Capture Form</title>
</head>
<body>
    <div id="lead-form-container"></div>
    
    <script type="module">
        import { LeadCaptureForm } from './crm/widgets/form-widget.js';
        
        const form = new LeadCaptureForm('lead-form-container', {
            apiEndpoint: 'https://api.example.com/leads',
            fields: {
                showPhone: true,
                showCompany: true,
                showProductInterest: true,
                showGeography: true
            },
            styling: {
                primaryColor: '#007bff',
                buttonText: 'Get Started',
                successMessage: 'Thank you! We\'ll be in touch soon.'
            }
        });
        
        form.render();
    </script>
</body>
</html>
```

### 2. Chat Widget

```html
<!DOCTYPE html>
<html>
<head>
    <title>Chat Widget</title>
</head>
<body>
    <div id="chat-widget-container"></div>
    
    <script type="module">
        import { LeadCaptureChat } from './crm/widgets/chat-widget.js';
        
        const chat = new LeadCaptureChat('chat-widget-container', {
            apiEndpoint: 'https://api.example.com/leads/chat',
            styling: {
                primaryColor: '#007bff',
                position: 'bottom-right',
                welcomeMessage: 'Hi! How can we help you today?',
                botName: 'SimpleCRM Support'
            }
        });
        
        chat.render();
    </script>
</body>
</html>
```

### 3. Backend Lead Capture Service

```typescript
import { 
    LeadCaptureService, 
    LeadAssignmentEngine, 
    CRMPipeline,
    Lead 
} from './crm';
import { exampleRules } from './crm/config.example';

// Implement your CRM pipeline
class MyCRMPipeline implements CRMPipeline {
    async addLead(lead: Lead): Promise<void> {
        // Add lead to your CRM database
        console.log('Adding lead to CRM:', lead);
        
        // Send notification to assigned sales rep
        if (lead.assignedTo) {
            await this.notifySalesRep(lead.assignedTo, lead);
        }
    }
    
    private async notifySalesRep(repId: string, lead: Lead): Promise<void> {
        // Implementation for notifying sales rep
    }
}

// Initialize the lead capture service
const assignmentEngine = new LeadAssignmentEngine(exampleRules);
const pipeline = new MyCRMPipeline();
const leadCapture = new LeadCaptureService(assignmentEngine, pipeline);

// API endpoint handler example (Express.js)
app.post('/api/leads', async (req, res) => {
    try {
        const lead = await leadCapture.captureFromForm(req.body);
        res.json({ success: true, leadId: lead.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/leads/chat', async (req, res) => {
    try {
        const lead = await leadCapture.captureFromChat(req.body);
        res.json({ success: true, leadId: lead.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
```

## Lead Assignment Rules

Configure rules to automatically assign leads to sales reps based on geography, product interest, or custom criteria.

### Rule Configuration

```typescript
import { AssignmentRule } from './crm';

const rules: AssignmentRule[] = [
    {
        id: 'rule_geo_west',
        name: 'West Coast Assignment',
        priority: 1,
        enabled: true,
        assignTo: 'sales_rep_west_001',
        conditions: [
            {
                field: 'geography',
                operator: 'in',
                value: ['California', 'Oregon', 'Washington', 'Nevada']
            }
        ]
    },
    {
        id: 'rule_product_enterprise',
        name: 'Enterprise Product Line',
        priority: 2,
        enabled: true,
        assignTo: 'sales_rep_enterprise_001',
        conditions: [
            {
                field: 'productInterest',
                operator: 'contains',
                value: 'enterprise'
            }
        ]
    }
];
```

### Rule Operators

- `equals` - Exact match (case-insensitive)
- `contains` - Field contains the value (case-insensitive)
- `startsWith` - Field starts with the value (case-insensitive)
- `in` - Field value is in the list of values

### Rule Priority

Rules are evaluated in order of priority (lower number = higher priority). The first matching rule wins.

## Custom Fields

Both form and chat widgets support custom fields:

```typescript
const form = new LeadCaptureForm('container', {
    apiEndpoint: 'https://api.example.com/leads',
    customFields: [
        {
            name: 'budget',
            label: 'Budget Range',
            type: 'select',
            required: true,
            options: ['Under $10k', '$10k-$50k', '$50k-$100k', 'Over $100k']
        },
        {
            name: 'timeline',
            label: 'When do you need this?',
            type: 'select',
            options: ['Immediately', 'Within 1 month', 'Within 3 months', '3+ months']
        }
    ]
});
```

## Lead Data Structure

```typescript
interface Lead {
    id: string;                      // Auto-generated unique ID
    firstName: string;               // Required
    lastName: string;                // Required
    email: string;                   // Required, validated
    phone?: string;                  // Optional
    company?: string;                // Optional
    jobTitle?: string;               // Optional
    source: LeadSource;              // 'web_form' | 'chat_widget' | 'manual' | 'import'
    productInterest?: string;        // Optional
    geography?: string;              // Optional
    message?: string;                // Optional
    createdAt: Date;                 // Auto-generated
    assignedTo?: string;             // Auto-assigned based on rules
    status: LeadStatus;              // 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
    customFields?: Record<string, any>; // Optional custom fields
}
```

## Styling Customization

### Form Widget Styling

```typescript
const form = new LeadCaptureForm('container', {
    apiEndpoint: 'https://api.example.com/leads',
    styling: {
        primaryColor: '#007bff',
        buttonText: 'Submit',
        successMessage: 'Thank you! We will be in touch soon.'
    }
});
```

### Chat Widget Styling

```typescript
const chat = new LeadCaptureChat('container', {
    apiEndpoint: 'https://api.example.com/leads/chat',
    styling: {
        primaryColor: '#007bff',
        position: 'bottom-right',  // or 'bottom-left'
        welcomeMessage: 'Hi! How can we help you today?',
        botName: 'SimpleCRM Support'
    }
});
```

## API Integration

### Expected Request Format

**POST /api/leads**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "jobTitle": "CTO",
    "productInterest": "Enterprise Solutions",
    "geography": "California",
    "message": "Interested in learning more",
    "customFields": {
        "budget": "$50k-$100k",
        "timeline": "Within 1 month"
    }
}
```

### Expected Response Format

**Success (200)**
```json
{
    "success": true,
    "leadId": "lead_1699876543210_abc123"
}
```

**Error (400)**
```json
{
    "error": "Valid email is required"
}
```

## Managing Assignment Rules

```typescript
const assignmentEngine = new LeadAssignmentEngine();

// Add a rule
assignmentEngine.addRule({
    id: 'rule_new',
    name: 'New Rule',
    priority: 5,
    enabled: true,
    assignTo: 'sales_rep_001',
    conditions: [
        { field: 'geography', operator: 'equals', value: 'Texas' }
    ]
});

// Update a rule
assignmentEngine.updateRule('rule_new', {
    priority: 3,
    enabled: false
});

// Remove a rule
assignmentEngine.removeRule('rule_new');

// Get all rules
const rules = assignmentEngine.getRules();
```

## Security Considerations

1. **Input Validation**: All lead data is validated before processing
2. **Email Validation**: Email format is validated using regex
3. **Required Fields**: Enforces required fields (firstName, lastName, email)
4. **HTTPS**: Always use HTTPS for API endpoints to protect data in transit
5. **Rate Limiting**: Implement rate limiting on your API endpoints to prevent abuse
6. **CORS**: Configure CORS properly if widgets are on different domains

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Examples

See `config.example.ts` for complete configuration examples including:
- Geography-based assignment rules
- Product line-based assignment rules
- Combined rules (multiple conditions)
- Sales rep configuration

## Acceptance Criteria

✅ **Build forms/chat widgets for capturing leads**
- ✅ Web form widget with customizable fields
- ✅ Chat widget with conversational interface
- ✅ Flexible configuration options
- ✅ Customizable styling

✅ **Feed captured leads into the CRM pipeline automatically**
- ✅ LeadCaptureService for processing leads
- ✅ CRMPipeline interface for integration
- ✅ Automatic lead creation with validation
- ✅ Source tracking (web form vs chat)

✅ **Implement functionality to assign leads to sales reps based on rules**
- ✅ LeadAssignmentEngine with configurable rules
- ✅ Geography-based assignment
- ✅ Product line-based assignment
- ✅ Multiple condition support
- ✅ Priority-based rule evaluation
- ✅ Dynamic rule management (add/update/remove)

## License

Internal use only - SimpleCRM Project
