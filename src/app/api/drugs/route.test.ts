// =============================================
// Integration Tests for Drugs API
// File: src/app/api/drugs/route.test.ts
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// 1. Mock Service Module sebelum import route
vi.mock('@/services/drug-service', () => ({
  ambilDaftarObat: vi.fn(),
  buatObat: vi.fn(),
  hitungTotalObat: vi.fn(),
}));

// 2. Import Service dan Factory
import { ambilDaftarObat, buatObat } from '@/services/drug-service';
import { createMockDrug, createMockDrugs } from '@/test/factories/drug-factory';
import { GET, POST } from './route';

describe('GET /api/drugs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return list of drugs with default pagination', async () => {
    // Menggunakan Factory untuk membuat 2 data obat lengkap
    const mockDrugs = createMockDrugs(2);

    vi.mocked(ambilDaftarObat).mockResolvedValue({
      data: mockDrugs,
      total: 2,
    });

    const request = new NextRequest('http://localhost:3000/api/drugs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toContain('Drug'); // Dicek dari factory
    expect(data.pagination.total).toBe(2);
    
    expect(ambilDaftarObat).toHaveBeenCalledWith({
      halaman: 1,
      batas: 20,
      kelas: undefined,
      cari: undefined,
    });
  });

  it('should handle pagination parameters', async () => {
    vi.mocked(ambilDaftarObat).mockResolvedValue({ data: [], total: 0 });

    const request = new NextRequest('http://localhost:3000/api/drugs?page=2&limit=10');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(ambilDaftarObat).toHaveBeenCalledWith({
      halaman: 2,
      batas: 10,
      kelas: undefined,
      cari: undefined,
    });
  });

  it('should filter by drug class', async () => {
    vi.mocked(ambilDaftarObat).mockResolvedValue({ data: [], total: 0 });

    const request = new NextRequest('http://localhost:3000/api/drugs?class=antibiotik');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(ambilDaftarObat).toHaveBeenCalledWith({
      halaman: 1,
      batas: 20,
      kelas: 'antibiotik',
      cari: undefined,
    });
  });

  it('should search drugs by name', async () => {
    vi.mocked(ambilDaftarObat).mockResolvedValue({ data: [], total: 0 });

    const request = new NextRequest('http://localhost:3000/api/drugs?search=paracetamol');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(ambilDaftarObat).toHaveBeenCalledWith({
      halaman: 1,
      batas: 20,
      kelas: undefined,
      cari: 'paracetamol',
    });
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(ambilDaftarObat).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/drugs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

describe('POST /api/drugs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new drug successfully', async () => {
    const inputData = {
      name: 'Amoxicillin Test',
      genericName: 'Amoxicillin',
      drugClass: 'antibiotik',
    };

    // Factory menjamin objek yang dikembalikan lengkap (id, dates, dll)
    const savedDrug = createMockDrug(inputData);

    vi.mocked(buatObat).mockResolvedValue(savedDrug);

    const request = new NextRequest('http://localhost:3000/api/drugs', {
      method: 'POST',
      body: JSON.stringify(inputData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBeDefined();
    expect(data.data.name).toBe('Amoxicillin Test');
    expect(data.message).toBe('Obat berhasil dibuat');
  });

  it('should reject invalid drug data (missing name)', async () => {
    const invalidData = { genericName: 'Test Generic' };

    const request = new NextRequest('http://localhost:3000/api/drugs', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });

  it('should validate drug class enum', async () => {
    const invalidDrug = {
      name: 'Test Drug',
      drugClass: 'kelas_ngawur', 
    };

    const request = new NextRequest('http://localhost:3000/api/drugs', {
      method: 'POST',
      body: JSON.stringify(invalidDrug),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle database errors during creation', async () => {
    vi.mocked(buatObat).mockRejectedValue(new Error('Write Error'));

    const request = new NextRequest('http://localhost:3000/api/drugs', {
      method: 'POST',
      body: JSON.stringify({ name: 'Error Drug' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});