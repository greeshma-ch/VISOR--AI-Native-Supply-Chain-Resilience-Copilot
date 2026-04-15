
import { RiskStatus, Supplier, Disruption } from './types';

export const CATEGORIES = [
  'Electronics',
  'Semiconductors',
  'Automotive',
  'Textiles',
  'F&B',
  'Logistics'
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: 'Advanced Micro Circuits',
    category: 'Semiconductors',
    location: 'Taiwan, Hsinchu',
    coordinates: [24.78, 120.99],
    status: RiskStatus.STABLE,
    contactEmail: 'logistics@amc-taiwan.com',
    lastUpdated: '2024-05-15T10:00:00Z'
  },
  {
    id: 's2',
    name: 'Global Logistics Hub',
    category: 'Logistics',
    location: 'Netherlands, Rotterdam',
    coordinates: [51.92, 4.47],
    status: RiskStatus.CAUTION,
    contactEmail: 'ops@glh-rotterdam.nl',
    lastUpdated: '2024-05-16T08:30:00Z'
  },
  {
    id: 's3',
    name: 'South Sea Textiles',
    category: 'Textiles',
    location: 'Vietnam, Ho Chi Minh',
    coordinates: [10.82, 106.62],
    status: RiskStatus.RISKY,
    contactEmail: 'sales@southsea-tex.vn',
    lastUpdated: '2024-05-16T14:15:00Z'
  },
  {
    id: 's4',
    name: 'Bavarian Motor Parts',
    category: 'Automotive',
    location: 'Germany, Munich',
    coordinates: [48.13, 11.58],
    status: RiskStatus.STABLE,
    contactEmail: 'procurement@bmp-ag.de',
    lastUpdated: '2024-05-14T09:00:00Z'
  },
  {
    id: 's5',
    name: 'Tokyo Electron Components',
    category: 'Electronics',
    location: 'Japan, Tokyo',
    coordinates: [35.67, 139.65],
    status: RiskStatus.CAUTION,
    contactEmail: 'support@tokyo-el.jp',
    lastUpdated: '2024-05-16T11:00:00Z'
  },
  {
    id: 's6',
    name: 'Organic Grain Corp',
    category: 'F&B',
    location: 'USA, Chicago',
    coordinates: [41.87, -87.62],
    status: RiskStatus.STABLE,
    contactEmail: 'orders@organic-grain.com',
    lastUpdated: '2024-05-15T16:45:00Z'
  }
];

export const MOCK_DISRUPTIONS: Disruption[] = [
  {
    id: 'd1',
    title: 'Port Strike in Rotterdam',
    type: 'Strike',
    severity: 'High',
    location: 'Rotterdam, Netherlands',
    timestamp: '2024-05-16T06:00:00Z',
    summary: 'Ongoing union strikes at major terminals causing 48-hour vessel delays.',
    impactedSuppliers: ['s2']
  },
  {
    id: 'd2',
    title: 'Typhoon Ewan Alert',
    type: 'Weather',
    severity: 'Medium',
    location: 'South China Sea',
    timestamp: '2024-05-15T18:00:00Z',
    summary: 'Expected heavy rainfall and strong winds affecting regional shipping routes.',
    impactedSuppliers: ['s3', 's1']
  },
  {
    id: 'd3',
    title: 'Semiconductor Shortage Spike',
    type: 'Logistics',
    severity: 'High',
    location: 'East Asia',
    timestamp: '2024-05-17T09:00:00Z',
    summary: 'Sudden demand spike in consumer electronics straining existing chip allocations.',
    impactedSuppliers: ['s1', 's5']
  }
];
