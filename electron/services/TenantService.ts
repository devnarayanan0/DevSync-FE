import { getApiClient } from './ApiClient';
import { getSetting, setSetting } from './DatabaseService';

export class TenantService {
  static async createTenant(tenantName: string, provider: 'AWS' | 'GDRIVE'): Promise<any> {
    try {
      const client = getApiClient();
      const response = await client.post('/api/connection/create', { tenantName, provider });
      const tenant = response.data;

      if (tenant && tenant.tenantId) {
        setSetting('tenant_id', tenant.tenantId);
        setSetting('tenant_name', tenant.tenantName);
        setSetting('tenant_provider', tenant.provider);
        setSetting('tenant_status', tenant.status);
        console.log(`[TenantService] Tenant created & registered in SQLite: ${tenant.tenantId}`);
        return tenant;
      }
      throw new Error('Connection creation failed. Invalid response payload.');
    } catch (err: any) {
      console.error('[TenantService] Failed to create tenant:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Tenant registration failed');
    }
  }

  static getActiveTenant(): any | null {
    const tenantId = getSetting('tenant_id');
    if (!tenantId) return null;

    return {
      tenantId,
      tenantName: getSetting('tenant_name'),
      provider: getSetting('tenant_provider'),
      status: getSetting('tenant_status')
    };
  }

  static updateTenantStatus(status: string): void {
    setSetting('tenant_status', status);
  }
}
