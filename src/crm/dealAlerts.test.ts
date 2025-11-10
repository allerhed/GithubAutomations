import {
  detectStalledDeals,
  calculateDaysInStage,
  getThresholdForStage,
  filterDeals,
  DEFAULT_ALERT_CONFIG,
} from './dealAlerts';
import { Deal, DealAlertConfig } from './types';

describe('Deal Alerts', () => {
  describe('calculateDaysInStage', () => {
    it('should calculate days correctly for same day', () => {
      const date = new Date('2025-01-01T10:00:00Z');
      const days = calculateDaysInStage(date, date);
      expect(days).toBe(0);
    });

    it('should calculate days correctly for different dates', () => {
      const startDate = new Date('2025-01-01T10:00:00Z');
      const endDate = new Date('2025-01-31T10:00:00Z');
      const days = calculateDaysInStage(startDate, endDate);
      expect(days).toBe(30);
    });

    it('should handle date differences across months', () => {
      const startDate = new Date('2024-12-15T00:00:00Z');
      const endDate = new Date('2025-01-15T00:00:00Z');
      const days = calculateDaysInStage(startDate, endDate);
      expect(days).toBe(31);
    });
  });

  describe('getThresholdForStage', () => {
    it('should return stage-specific threshold when available', () => {
      const config: DealAlertConfig = {
        defaultThresholdDays: 30,
        stageThresholds: {
          'prospecting': 14,
        },
      };
      
      const threshold = getThresholdForStage('prospecting', config);
      expect(threshold).toBe(14);
    });

    it('should return default threshold when stage-specific not available', () => {
      const config: DealAlertConfig = {
        defaultThresholdDays: 30,
        stageThresholds: {
          'prospecting': 14,
        },
      };
      
      const threshold = getThresholdForStage('unknown-stage', config);
      expect(threshold).toBe(30);
    });

    it('should return default threshold when stageThresholds is undefined', () => {
      const config: DealAlertConfig = {
        defaultThresholdDays: 45,
      };
      
      const threshold = getThresholdForStage('any-stage', config);
      expect(threshold).toBe(45);
    });
  });

  describe('detectStalledDeals', () => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Deal 1 - Fresh',
        value: 10000,
        expectedCloseDate: new Date('2025-03-01'),
        owner: 'john@example.com',
        stage: 'prospecting',
        stageEnteredAt: new Date('2025-01-29'), // 2 days ago from Jan 31
      },
      {
        id: '2',
        title: 'Deal 2 - Stalled in Prospecting',
        value: 20000,
        expectedCloseDate: new Date('2025-02-15'),
        owner: 'jane@example.com',
        stage: 'prospecting',
        stageEnteredAt: new Date('2025-01-01'), // 30 days ago
      },
      {
        id: '3',
        title: 'Deal 3 - Stalled in Negotiation',
        value: 50000,
        expectedCloseDate: new Date('2025-02-01'),
        owner: 'bob@example.com',
        stage: 'negotiation',
        stageEnteredAt: new Date('2025-01-15'), // 16 days ago
      },
    ];

    it('should detect stalled deals based on thresholds', () => {
      const currentDate = new Date('2025-01-31');
      const alerts = detectStalledDeals(mockDeals, DEFAULT_ALERT_CONFIG, currentDate);
      
      expect(alerts).toHaveLength(2);
      expect(alerts[0].deal.id).toBe('2');
      expect(alerts[0].daysInStage).toBe(30);
      expect(alerts[1].deal.id).toBe('3');
      expect(alerts[1].daysInStage).toBe(16);
    });

    it('should return empty array when no deals are stalled', () => {
      const freshDeals: Deal[] = [
        {
          id: '1',
          title: 'Fresh Deal',
          value: 10000,
          expectedCloseDate: new Date('2025-02-15'),
          owner: 'john@example.com',
          stage: 'prospecting',
          stageEnteredAt: new Date('2025-01-30'),
        },
      ];
      
      const currentDate = new Date('2025-01-31');
      const alerts = detectStalledDeals(freshDeals, DEFAULT_ALERT_CONFIG, currentDate);
      
      expect(alerts).toHaveLength(0);
    });

    it('should use custom config when provided', () => {
      const customConfig: DealAlertConfig = {
        defaultThresholdDays: 5,
      };
      
      const deals: Deal[] = [
        {
          id: '1',
          title: 'Deal 1',
          value: 10000,
          expectedCloseDate: new Date('2025-02-15'),
          owner: 'john@example.com',
          stage: 'prospecting',
          stageEnteredAt: new Date('2025-01-20'),
        },
      ];
      
      const currentDate = new Date('2025-01-31');
      const alerts = detectStalledDeals(deals, customConfig, currentDate);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0].daysInStage).toBe(11);
      expect(alerts[0].threshold).toBe(5);
    });

    it('should set correct severity levels', () => {
      const deals: Deal[] = [
        {
          id: '1',
          title: 'Slightly Stalled',
          value: 10000,
          expectedCloseDate: new Date('2025-02-15'),
          owner: 'john@example.com',
          stage: 'prospecting',
          stageEnteredAt: new Date('2025-01-15'), // 16 days - just over threshold of 14
        },
        {
          id: '2',
          title: 'Very Stalled',
          value: 20000,
          expectedCloseDate: new Date('2025-02-15'),
          owner: 'jane@example.com',
          stage: 'prospecting',
          stageEnteredAt: new Date('2025-01-01'), // 30 days - more than double threshold
        },
      ];
      
      const currentDate = new Date('2025-01-31');
      const alerts = detectStalledDeals(deals, DEFAULT_ALERT_CONFIG, currentDate);
      
      expect(alerts).toHaveLength(2);
      expect(alerts[0].severity).toBe('warning');
      expect(alerts[1].severity).toBe('critical');
    });

    it('should include informative alert messages', () => {
      const deals: Deal[] = [
        {
          id: '1',
          title: 'Test Deal',
          value: 10000,
          expectedCloseDate: new Date('2025-02-15'),
          owner: 'john@example.com',
          stage: 'prospecting',
          stageEnteredAt: new Date('2025-01-01'),
        },
      ];
      
      const currentDate = new Date('2025-01-31');
      const alerts = detectStalledDeals(deals, DEFAULT_ALERT_CONFIG, currentDate);
      
      expect(alerts[0].message).toContain('Test Deal');
      expect(alerts[0].message).toContain('prospecting');
      expect(alerts[0].message).toContain('30 days');
      expect(alerts[0].message).toContain('threshold: 14 days');
    });
  });

  describe('filterDeals', () => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Deal 1',
        value: 10000,
        expectedCloseDate: new Date('2025-02-15'),
        owner: 'john@example.com',
        stage: 'prospecting',
        stageEnteredAt: new Date('2025-01-01'),
      },
      {
        id: '2',
        title: 'Deal 2',
        value: 20000,
        expectedCloseDate: new Date('2025-02-20'),
        owner: 'jane@example.com',
        stage: 'negotiation',
        stageEnteredAt: new Date('2025-01-10'),
      },
      {
        id: '3',
        title: 'Deal 3',
        value: 30000,
        expectedCloseDate: new Date('2025-03-01'),
        owner: 'john@example.com',
        stage: 'negotiation',
        stageEnteredAt: new Date('2025-01-15'),
      },
    ];

    it('should filter deals by owner', () => {
      const filtered = filterDeals(mockDeals, 'john@example.com');
      expect(filtered).toHaveLength(2);
      expect(filtered.every((d: Deal) => d.owner === 'john@example.com')).toBe(true);
    });

    it('should filter deals by stage', () => {
      const filtered = filterDeals(mockDeals, undefined, 'negotiation');
      expect(filtered).toHaveLength(2);
      expect(filtered.every((d: Deal) => d.stage === 'negotiation')).toBe(true);
    });

    it('should filter deals by both owner and stage', () => {
      const filtered = filterDeals(mockDeals, 'john@example.com', 'negotiation');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('3');
    });

    it('should return all deals when no filters applied', () => {
      const filtered = filterDeals(mockDeals);
      expect(filtered).toHaveLength(3);
    });

    it('should return empty array when no deals match filters', () => {
      const filtered = filterDeals(mockDeals, 'nonexistent@example.com');
      expect(filtered).toHaveLength(0);
    });
  });
});
