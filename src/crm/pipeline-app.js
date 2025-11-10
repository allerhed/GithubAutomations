// Sample deal data
const sampleDeals = [
    {
        id: 1,
        title: "Enterprise Software License",
        company: "Acme Corp",
        value: 50000,
        owner: "John Smith",
        closeDate: "2025-12-15",
        stage: "lead"
    },
    {
        id: 2,
        title: "Cloud Migration Project",
        company: "TechStart Inc",
        value: 125000,
        owner: "Sarah Johnson",
        closeDate: "2025-11-30",
        stage: "qualified"
    },
    {
        id: 3,
        title: "Annual Support Contract",
        company: "Global Industries",
        value: 35000,
        owner: "Mike Davis",
        closeDate: "2025-12-01",
        stage: "proposal"
    },
    {
        id: 4,
        title: "Custom Development",
        company: "InnovateCo",
        value: 85000,
        owner: "Emily Chen",
        closeDate: "2025-11-20",
        stage: "negotiation"
    },
    {
        id: 5,
        title: "Platform Integration",
        company: "DataFlow Systems",
        value: 45000,
        owner: "John Smith",
        closeDate: "2025-10-15",
        stage: "closed-won"
    }
];

// Application state
let deals = [...sampleDeals];
let draggedDeal = null;

// Initialize the application
function initApp() {
    // Load deals from localStorage or use sample data
    const savedDeals = localStorage.getItem('crm-deals');
    if (savedDeals) {
        deals = JSON.parse(savedDeals);
    }
    
    renderAllDeals();
    updateAllStats();
    setupEventListeners();
}

// Render all deals to their respective stages
function renderAllDeals() {
    // Clear all stage contents
    document.querySelectorAll('.stage-content').forEach(stage => {
        stage.innerHTML = '';
    });
    
    // Render each deal
    deals.forEach(deal => {
        renderDeal(deal);
    });
}

// Render a single deal card
function renderDeal(deal) {
    const stageContent = document.querySelector(`.stage-content[data-stage-name="${deal.stage}"]`);
    if (!stageContent) return;
    
    const dealCard = document.createElement('div');
    dealCard.className = 'deal-card';
    dealCard.draggable = true;
    dealCard.dataset.dealId = deal.id;
    
    const closeDate = new Date(deal.closeDate);
    const formattedDate = closeDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    dealCard.innerHTML = `
        <div class="deal-title">${deal.title}</div>
        <div class="deal-company">${deal.company}</div>
        <div class="deal-value">$${deal.value.toLocaleString()}</div>
        <div class="deal-meta">
            <span class="deal-owner">👤 ${deal.owner}</span>
            <span class="deal-date">📅 ${formattedDate}</span>
        </div>
    `;
    
    // Add drag event listeners
    dealCard.addEventListener('dragstart', handleDragStart);
    dealCard.addEventListener('dragend', handleDragEnd);
    
    stageContent.appendChild(dealCard);
}

// Handle drag start
function handleDragStart(e) {
    draggedDeal = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

// Handle drag end
function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove drag-over class from all stages
    document.querySelectorAll('.stage-content').forEach(stage => {
        stage.classList.remove('drag-over');
    });
}

// Handle drag over
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

// Handle drag enter
function handleDragEnter(e) {
    this.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    if (e.target === this) {
        this.classList.remove('drag-over');
    }
}

// Handle drop
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedDeal) {
        const newStage = this.dataset.stageName;
        const dealId = parseInt(draggedDeal.dataset.dealId);
        
        // Update deal stage in data
        const deal = deals.find(d => d.id === dealId);
        if (deal) {
            deal.stage = newStage;
            saveDealsTolocalStorage();
            
            // Re-render all deals and update stats
            renderAllDeals();
            updateAllStats();
        }
    }
    
    return false;
}

// Update statistics for all stages
function updateAllStats() {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won'];
    let totalValue = 0;
    
    stages.forEach(stageName => {
        const stageDeals = deals.filter(d => d.stage === stageName);
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        const stageCount = stageDeals.length;
        
        totalValue += stageValue;
        
        const stageElement = document.querySelector(`.pipeline-stage[data-stage="${stageName}"]`);
        if (stageElement) {
            stageElement.querySelector('.stage-count').textContent = `${stageCount} deal${stageCount !== 1 ? 's' : ''}`;
            stageElement.querySelector('.stage-value').textContent = `$${stageValue.toLocaleString()}`;
        }
    });
    
    document.getElementById('totalValue').textContent = totalValue.toLocaleString();
}

// Setup all event listeners
function setupEventListeners() {
    // Setup drag and drop for all stage contents
    document.querySelectorAll('.stage-content').forEach(stage => {
        stage.addEventListener('dragover', handleDragOver);
        stage.addEventListener('dragenter', handleDragEnter);
        stage.addEventListener('dragleave', handleDragLeave);
        stage.addEventListener('drop', handleDrop);
    });
    
    // Modal controls
    const modal = document.getElementById('dealModal');
    const addDealBtn = document.getElementById('addDealBtn');
    const closeBtn = document.querySelector('.close');
    const dealForm = document.getElementById('dealForm');
    
    addDealBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    dealForm.addEventListener('submit', handleAddDeal);
}

// Handle adding a new deal
function handleAddDeal(e) {
    e.preventDefault();
    
    const title = document.getElementById('dealTitle').value;
    const company = document.getElementById('dealCompany').value;
    const value = parseInt(document.getElementById('dealValue').value);
    const owner = document.getElementById('dealOwner').value;
    const closeDate = document.getElementById('dealCloseDate').value;
    
    const newDeal = {
        id: Date.now(), // Simple ID generation
        title,
        company,
        value,
        owner,
        closeDate,
        stage: 'lead' // New deals start in lead stage
    };
    
    deals.push(newDeal);
    saveDealsTolocalStorage();
    
    renderAllDeals();
    updateAllStats();
    
    // Close modal and reset form
    document.getElementById('dealModal').classList.remove('show');
    document.getElementById('dealForm').reset();
}

// Save deals to localStorage
function saveDealsTolocalStorage() {
    localStorage.setItem('crm-deals', JSON.stringify(deals));
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
