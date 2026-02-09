import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium - Minor Issue' | 'High - Urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  responses?: string[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'patient-management' | 'mmu' | 'reports' | 'advanced';
  duration: number; // in minutes
  icon: string;
  steps: TutorialStep[];
  completed: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional instruction
}

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private readonly TICKETS_STORAGE_KEY = 'supportTickets';
  private readonly TUTORIALS_STORAGE_KEY = 'completedTutorials';

  private ticketsSubject = new BehaviorSubject<SupportTicket[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  private tutorialsSubject = new BehaviorSubject<Tutorial[]>([]);
  public tutorials$ = this.tutorialsSubject.asObservable();

  constructor() {
    this.loadTickets();
    this.initializeTutorials();
  }

  private loadTickets(): void {
    try {
      const stored = localStorage.getItem(this.TICKETS_STORAGE_KEY);
      if (stored) {
        const tickets = JSON.parse(stored);
        this.ticketsSubject.next(tickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      this.ticketsSubject.next([]);
    }
  }

  private saveTickets(tickets: SupportTicket[]): void {
    try {
      localStorage.setItem(this.TICKETS_STORAGE_KEY, JSON.stringify(tickets));
      this.ticketsSubject.next(tickets);
    } catch (error) {
      console.error('Failed to save tickets:', error);
    }
  }

  private initializeTutorials(): void {
    const tutorials: Tutorial[] = [
      {
        id: 'tutorial-001',
        title: 'How to Add a Patient',
        description: 'Learn how to register a new patient in the system',
        category: 'patient-management',
        duration: 5,
        icon: 'bi-person-plus',
        completed: false,
        steps: [
          {
            id: 'step-1',
            title: 'Navigate to My Clinic',
            description: 'Click on the "My Clinic" option in the sidebar to view the dashboard.',
            targetSelector: '.nav-item[title="My Clinic"]',
            position: 'right',
          },
          {
            id: 'step-2',
            title: 'Find the Add Patient Button',
            description: 'Look for the "Add Patient" button in the patient list area.',
            targetSelector: '.add-patient-btn',
            position: 'bottom',
          },
          {
            id: 'step-3',
            title: 'Fill in Patient Details',
            description: 'Enter the patient\'s personal information including name, DOB, and SSN.',
            targetSelector: '.patient-form',
            position: 'top',
          },
          {
            id: 'step-4',
            title: 'Submit',
            description: 'Click the "Save" button to create the patient record.',
            targetSelector: '.submit-btn',
            position: 'left',
          },
        ],
      },
      {
        id: 'tutorial-002',
        title: 'Understanding Break Glass Access',
        description: 'Learn how to request emergency access to restricted patient records',
        category: 'patient-management',
        duration: 8,
        icon: 'bi-shield-exclamation',
        completed: false,
        steps: [
          {
            id: 'step-1',
            title: 'What is Break Glass?',
            description:
              'Break Glass is an emergency access feature that allows you to view a patient record from another facility when clinically necessary.',
            position: 'bottom',
          },
          {
            id: 'step-2',
            title: 'When to Use It',
            description:
              'Use Break Glass only when you have a valid clinical or administrative reason to access the restricted record.',
            position: 'bottom',
          },
          {
            id: 'step-3',
            title: 'Attestation',
            description: 'You will be asked to confirm that you have a valid reason for accessing the record.',
            position: 'bottom',
          },
          {
            id: 'step-4',
            title: 'Access Duration',
            description: 'Your emergency access will be valid for 24 hours, after which you will need to request it again.',
            position: 'bottom',
          },
        ],
      },
      {
        id: 'tutorial-003',
        title: 'Mobile Unit (MMU) Workflow',
        description: 'Master the mobile medication unit workflow',
        category: 'mmu',
        duration: 10,
        icon: 'bi-bus-front',
        completed: false,
        steps: [
          {
            id: 'step-1',
            title: 'Access Mobile Unit',
            description: 'Click on "Mobile Unit" in the sidebar to access the MMU interface.',
            targetSelector: '.nav-item[title="Mobile Unit"]',
            position: 'right',
          },
          {
            id: 'step-2',
            title: 'Select a Stop',
            description: 'Choose a stop location from the available list or add a new stop.',
            targetSelector: '.stop-selector',
            position: 'bottom',
          },
          {
            id: 'step-3',
            title: 'Search for Patient',
            description: 'Search for the patient you want to serve at this stop.',
            targetSelector: '.patient-search',
            position: 'bottom',
          },
          {
            id: 'step-4',
            title: 'Log Dose',
            description: 'Record the medication dose and any counseling services provided.',
            targetSelector: '.dose-form',
            position: 'top',
          },
          {
            id: 'step-5',
            title: 'Submit Encounter',
            description: 'Save the encounter and it will appear in the "Today\'s Encounters" section.',
            targetSelector: '.save-encounter-btn',
            position: 'left',
          },
        ],
      },
      {
        id: 'tutorial-004',
        title: 'Searching and Filtering Patients',
        description: 'Learn how to effectively search for patients in the registry',
        category: 'patient-management',
        duration: 4,
        icon: 'bi-search',
        completed: false,
        steps: [
          {
            id: 'step-1',
            title: 'Global Search',
            description: 'Use the search bar at the top of the page to search for patients by name or ID.',
            targetSelector: '.search-container',
            position: 'bottom',
          },
          {
            id: 'step-2',
            title: 'Search Tips',
            description: 'You can search by first name, last name, or registry ID. Partial matches work too.',
            position: 'bottom',
          },
          {
            id: 'step-3',
            title: 'Privacy Considerations',
            description:
              'Some results may require attestation if they are from other facilities. This is for patient privacy.',
            position: 'bottom',
          },
        ],
      },
      {
        id: 'tutorial-005',
        title: 'Viewing Reports',
        description: 'Learn how to access and interpret compliance reports',
        category: 'reports',
        duration: 7,
        icon: 'bi-bar-chart',
        completed: false,
        steps: [
          {
            id: 'step-1',
            title: 'Access Reports',
            description: 'Click on "Reports" in the sidebar (available for managers and admins).',
            targetSelector: '.nav-item[title="Reports"]',
            position: 'right',
          },
          {
            id: 'step-2',
            title: 'Select Report Type',
            description: 'Choose the type of report you want to view (Break Glass, Compliance, etc.).',
            position: 'bottom',
          },
          {
            id: 'step-3',
            title: 'Filter Data',
            description: 'Use date ranges and other filters to customize your report.',
            position: 'bottom',
          },
          {
            id: 'step-4',
            title: 'Export or Print',
            description: 'Export the report as PDF or CSV, or print directly from the browser.',
            position: 'bottom',
          },
        ],
      },
    ];

    this.tutorialsSubject.next(tutorials);
  }

  submitTicket(subject: string, description: string, priority: string): SupportTicket {
    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject,
      description,
      priority: (priority as 'Low' | 'Medium - Minor Issue' | 'High - Urgent') || 'Medium - Minor Issue',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };

    const currentTickets = this.ticketsSubject.value;
    const updatedTickets = [ticket, ...currentTickets];
    this.saveTickets(updatedTickets);

    return ticket;
  }

  getTickets(): SupportTicket[] {
    return this.ticketsSubject.value;
  }

  getTutorials(): Tutorial[] {
    return this.tutorialsSubject.value;
  }

  markTutorialCompleted(tutorialId: string): void {
    const tutorials = this.tutorialsSubject.value.map((t) =>
      t.id === tutorialId ? { ...t, completed: true } : t,
    );
    this.tutorialsSubject.next(tutorials);

    try {
      const completed = tutorials.filter((t) => t.completed).map((t) => t.id);
      localStorage.setItem(this.TUTORIALS_STORAGE_KEY, JSON.stringify(completed));
    } catch (error) {
      console.error('Failed to save tutorial completion:', error);
    }
  }

  addTicketResponse(ticketId: string, response: string): void {
    const tickets = this.ticketsSubject.value.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          responses: [...(t.responses || []), response],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.saveTickets(tickets);
  }

  updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in-progress' | 'resolved' | 'closed',
  ): void {
    const tickets = this.ticketsSubject.value.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.saveTickets(tickets);
  }
}
