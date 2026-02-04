import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OfflineStorageService } from './offline-storage.service';

export interface Facility {
  id: string;
  name: string;
  type: 'otc' | 'mmu'; // OTC or Mobile Medication Unit
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax?: string;
  services: string[];
  keyPersonnel: {
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }[];
  programSponsor?: string;
  medicalDirector?: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastVerified?: string;
  lastReviewedDate?: string;
}

export interface MMUStop {
  id: string;
  mmuId: string;
  location: string;
  day: string; // e.g., "Monday"
  time: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  private currentFacilitySubject = new BehaviorSubject<Facility | null>(null);
  public currentFacility$ = this.currentFacilitySubject.asObservable();
  private initializationPromise: Promise<void>;

  constructor(private offlineStorage: OfflineStorageService) {
    this.initializationPromise = this.initializeAlaskaFacilities();
  }

  /**
   * Initialize Alaska OTP facilities (demo data)
   */
  private async initializeAlaskaFacilities(): Promise<void> {
    const facilities = await this.offlineStorage.getAll<Facility>('facilities');
    if (facilities.length === 0) {
      await this.loadAlaskaFacilities();
    }
  }

  private async loadAlaskaFacilities(): Promise<void> {
    const alaskaFacilities: Facility[] = [
      {
        id: 'fac-act-001',
        name: 'Anchorage Comprehensive Treatment Center',
        type: 'otc',
        address: '3230 C Street, Suite 100',
        city: 'Anchorage',
        state: 'AK',
        zip: '99503',
        phone: '(866) 403-4131',
        fax: '(907) 563-1234',
        services: ['Methadone', 'Suboxone', 'Subutex', 'Vivitrol', 'Counseling'],
        keyPersonnel: [
          { name: 'Dr. Evelyn Miller', role: 'Sponsor' },
          { name: 'Dr. James Wilson', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-01-29',
        region: 'Anchorage'
      },
      {
        id: 'fac-cms-anc-001',
        name: 'Community Medical Services – Anchorage',
        type: 'otc',
        address: '4335 Laurel Street',
        city: 'Anchorage',
        state: 'AK',
        zip: '99508',
        phone: '(907) 290-3760',
        fax: '(907) 290-3761',
        services: ['Methadone', 'Buprenorphine', 'Naltrexone', 'Counseling', 'Peer Support'],
        keyPersonnel: [
          { name: 'Noah King', role: 'Sponsor' },
          { name: 'Dr. Emilia Davis', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-01-19',
        region: 'Anchorage'
      },
      {
        id: 'fac-cms-was-001',
        name: 'Community Medical Services – Wasilla',
        type: 'otc',
        address: '2521 East Mountain Village Drive, Suite F',
        city: 'Wasilla',
        state: 'AK',
        zip: '99654',
        phone: '(907) 290-3760',
        fax: '(907) 290-3762',
        services: ['Methadone', 'Buprenorphine', 'Naltrexone', 'Counseling'],
        keyPersonnel: [
          { name: 'Claire Martinez', role: 'Sponsor' },
          { name: 'Dr. Thomas Moore', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-01-14',
        region: 'Mat-Su Valley'
      },
      {
        id: 'fac-iaa-001',
        name: 'Interior Medication Assisted Treatment',
        type: 'otc',
        address: '710 3rd Avenue',
        city: 'Fairbanks',
        state: 'AK',
        zip: '99701',
        phone: '(907) 452-4222',
        fax: '(907) 452-4223',
        services: ['Methadone', 'Buprenorphine', 'Specialized HIV support'],
        keyPersonnel: [
          { name: 'Lucas Wilson', role: 'Sponsor' },
          { name: 'Dr. Josephine Brown', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-02-01',
        region: 'Interior'
      },
      {
        id: 'fac-ndtc-001',
        name: 'Narcotic Drug Treatment Center (NDTC)',
        type: 'otc',
        address: '1015 East 6th Avenue',
        city: 'Anchorage',
        state: 'AK',
        zip: '99501',
        phone: '(907) 276-6430',
        fax: '(907) 276-6431',
        services: ['Methadone maintenance', 'Detoxification'],
        keyPersonnel: [
          { name: 'Michael Thompson', role: 'Sponsor' },
          { name: 'Dr. Luna Anderson', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2025-12-20',
        region: 'Anchorage'
      },
      {
        id: 'fac-searhc-jun-001',
        name: 'SEARHC – Juneau',
        type: 'otc',
        address: '1720 Crest Street',
        city: 'Juneau',
        state: 'AK',
        zip: '99801',
        phone: '(907) 463-0600',
        fax: '(907) 463-0601',
        services: ['Methadone', 'Buprenorphine', 'Counseling'],
        keyPersonnel: [
          { name: 'Elizabeth Taylor', role: 'Sponsor' },
          { name: 'Dr. River White', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2025-12-30',
        region: 'Southeast'
      },
      {
        id: 'fac-searhc-ket-001',
        name: 'SEARHC – Ketchikan',
        type: 'otc',
        address: '3050 5th Avenue, Suite 100',
        city: 'Ketchikan',
        state: 'AK',
        zip: '99901',
        phone: '(907) 463-0600',
        fax: '(907) 463-0602',
        services: ['Methadone', 'Buprenorphine', 'Counseling'],
        keyPersonnel: [
          { name: 'William Clark', role: 'Sponsor' },
          { name: 'Dr. Penelope Lewis', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-01-26',
        region: 'Southeast'
      },
      {
        id: 'fac-searhc-sit-001',
        name: 'SEARHC – Sitka',
        type: 'otc',
        address: '700 Katlian Street, Suite F',
        city: 'Sitka',
        state: 'AK',
        zip: '99835',
        phone: '(907) 463-0600',
        fax: '(907) 463-0603',
        services: ['Methadone', 'Buprenorphine', 'Counseling'],
        keyPersonnel: [
          { name: 'Joseph Hall', role: 'Sponsor' },
          { name: 'Dr. Nora King', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-01-22',
        region: 'Southeast'
      },
      {
        id: 'fac-searhc-kla-001',
        name: 'SEARHC – Klawock',
        type: 'otc',
        address: '7300 Klawock Hollis Highway',
        city: 'Klawock',
        state: 'AK',
        zip: '99925',
        phone: '(907) 463-0600',
        fax: '(907) 463-0604',
        services: ['Methadone', 'Buprenorphine', 'Counseling'],
        keyPersonnel: [
          { name: 'Charles Scott', role: 'Sponsor' },
          { name: 'Dr. Aurora Adams', role: 'Med Dir' }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVerified: '2026-01-06',
        region: 'Southeast'
      }
    ];

    for (const facility of alaskaFacilities) {
      await this.offlineStorage.put('facilities', facility);
    }
  }

  /**
   * Get all facilities
   */
  async getAllFacilities(): Promise<Facility[]> {
    await this.initializationPromise;
    return this.offlineStorage.getAll<Facility>('facilities');
  }

  /**
   * Get facility by ID
   */
  async getFacility(id: string): Promise<Facility | undefined> {
    await this.initializationPromise;
    return this.offlineStorage.get<Facility>('facilities', id);
  }

  /**
   * Create or update facility
   */
  async saveFacility(facility: Facility): Promise<Facility> {
    await this.initializationPromise;
    if (!facility.id) {
      facility.id = this.generateFacilityId();
    }
    facility.updatedAt = new Date().toISOString();
    await this.offlineStorage.put('facilities', facility);
    return facility;
  }

  /**
   * Delete facility
   */
  async deleteFacility(id: string): Promise<void> {
    await this.initializationPromise;
    await this.offlineStorage.delete('facilities', id);
  }

  /**
   * Get facilities by region
   */
  async getFacilitiesByRegion(region: string): Promise<Facility[]> {
    await this.initializationPromise;
    const facilities = await this.getAllFacilities();
    return facilities.filter((f) => f.region === region && f.isActive);
  }

  /**
   * Set current facility context
   */
  setCurrentFacility(facility: Facility | null): void {
    this.currentFacilitySubject.next(facility);
  }

  private generateFacilityId(): string {
    return 'fac-' + Math.random().toString(36).substr(2, 9);
  }
}
