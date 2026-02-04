import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ProjectReport {
    id: string;
    proposal_id: string;
    project_title: string;
    admin_id: string;
    admin_email: string;
    final_report: string;
    outcomes: string;
    national_impacts: string;
    is_commercialised: boolean;
    project_value?: string;
    cloud_documents_url?: string;
    createdAt: any;
}

const COLLECTION_NAME = 'project_reports';

export async function createProjectReport(data: Omit<ProjectReport, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating project report:', error);
        throw error;
    }
}

export async function getReportByProposalId(proposalId: string) {
    // Note: This would ideally use a query, but let's keep it simple for now
    // If we need to check if a report exists for a proposal
}
