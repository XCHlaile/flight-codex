export type AircraftCategory = 'fighter' | 'airliner' | 'helicopter' | 'drone' | 'transport';
export type EventType = 'accident' | 'first-flight' | 'record' | 'milestone';
export type ContentCategory = 'aircraft' | 'event' | 'expert';

export interface AircraftRecord {
  id: string;
  name: string;
  englishName: string;
  category: AircraftCategory;
  country: string;
  era: string;
  firstFlightYear: number;
  engineType: string;
  maxSpeedKmh: number;
  rangeKm: number;
  lengthM: number;
  wingspanM?: number;
  heightM?: number;
  crew?: string;
  imageUrl: string;
  summary: string;
  tags: string[];
  relatedEventIds: string[];
  relatedExpertIds: string[];
}

export interface AviationEventRecord {
  id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  summary: string;
  details: string;
  aircraftIds: string[];
}

export interface AviationExpertRecord {
  id: string;
  name: string;
  role: string;
  nationality: string;
  era: string;
  summary: string;
  details: string;
  representativeAircraftIds: string[];
}

export interface DashboardSummary {
  aircraftCount: number;
  eventCount: number;
  expertCount: number;
  compareReadyCount: number;
}

export interface CatalogResponse {
  aircraft: AircraftRecord[];
  events: AviationEventRecord[];
  experts: AviationExpertRecord[];
}

export interface CreateAircraftRequest {
  name: string;
  englishName: string;
  category: AircraftCategory;
  country: string;
  era: string;
  firstFlightYear: number;
  engineType: string;
  maxSpeedKmh: number;
  rangeKm: number;
  lengthM: number;
  wingspanM?: number;
  heightM?: number;
  crew?: string;
  imageUrl: string;
  summary: string;
  tags: string[];
  relatedEventIds: string[];
  relatedExpertIds: string[];
}
