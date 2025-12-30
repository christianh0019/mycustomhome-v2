import { supabase } from './supabase';

export type AuditAction =
    | 'viewed'
    | 'signed_by_business'
    | 'sent'
    | 'viewed_by_client'
    | 'signed_by_client'
    | 'completed'
    | 'field_updated';

interface GeoInfo {
    ip: string;
    city?: string;
    region?: string;
    country?: string;
    org?: string; // ISP or Organization
}

class AuditService {
    private async getGeoInfo(): Promise<GeoInfo> {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                org: data.org
            };
        } catch (error) {
            console.error('Failed to fetch geo info:', error);
            // Fallback to basic IP if possible, or just return empty/error info
            return { ip: 'unknown' };
        }
    }

    async logAction(documentId: string, action: AuditAction, userId?: string, extraDetails: any = {}) {
        const geo = await this.getGeoInfo();
        const userAgent = navigator.userAgent;

        const details = {
            ...extraDetails,
            ip: geo.ip,
            location: geo.city && geo.region ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Unknown Location',
            userAgent,
            timestamp: new Date().toISOString()
        };

        const { error } = await supabase.from('document_audit_logs').insert({
            document_id: documentId,
            user_id: userId || null, // Can be null for unauthenticated client viewers
            action,
            details
        });

        if (error) {
            console.error('Failed to log audit event:', error);
        }
    }

    async getLogs(documentId: string) {
        const { data, error } = await supabase
            .from('document_audit_logs')
            .select('*')
            .eq('document_id', documentId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }
}

export const auditService = new AuditService();
