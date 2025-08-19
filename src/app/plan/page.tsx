'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';


interface LessonPlan {
  id: string;
  level: string;
  subject: string;
  unit_name: string;
  objectives: string[];
  activities: string[];
  assessment: string;
  images: Array<{
    url: string;
    source?: string;
    alt?: string;
    attribution?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface ApiResponse {
  data: LessonPlan[];
  pagination: PaginationInfo;
}

interface FilterState {
  level: string;
  subject: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 6;

export default function PlansPage() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [allPlansForFilters, setAllPlansForFilters] = useState<LessonPlan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    level: '',
    subject: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // ฟังก์ชันลบแผนการสอน
  const handleDelete = async (id: string, unitName: string) => {
    const confirmDelete = window.confirm(
      `คุณต้องการลบแผนการสอน "${unitName}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`
    );
    
    if (!confirmDelete) return;
    
    try {
      setDeleteLoading(id);
      await axios.delete(`/api/lesson_plans/${id}`);
      
      // รีเฟรชข้อมูล
      await fetchPlans();
      alert('✅ ลบแผนการสอนเรียบร้อยแล้ว');
      
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`❌ เกิดข้อผิดพลาด: ${error.response?.data?.error || 'ไม่สามารถลบได้'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // ฟังก์ชันดึงข้อมูล (แยกออกมาเพื่อให้เรียกใช้ได้)
  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      // เพิ่ม filter parameters หากมี
      if (filters.level) params.append('level', filters.level);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/lesson_plans?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const result: ApiResponse = await response.json();
      setPlans(result.data);
      setPagination(result.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('ไม่สามารถดึงข้อมูลแผนการเรียนรู้ได้');
      setPlans([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลแผนการเรียนรู้ทั้งหมดเพื่อใช้สำหรับ filter options
  useEffect(() => {
    const fetchAllPlansForFilters = async () => {
      try {
        const response = await fetch('/api/lesson_plans?pagination=false');
        if (response.ok) {
          const result = await response.json();
          setAllPlansForFilters(result.data || result);
        }
      } catch (err) {
        console.error('Failed to fetch plans for filters:', err);
      }
    };

    fetchAllPlansForFilters();
  }, []);

  // ดึงข้อมูลแผนการเรียนรู้แบบ pagination พร้อม filters
  useEffect(() => {
    fetchPlans();
  }, [currentPage, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.level, filters.subject, filters.search]);

  // Get unique values for filter options
  const uniqueLevels = [...new Set(allPlansForFilters.map(plan => plan.level))];
  const uniqueSubjects = [...new Set(allPlansForFilters.map(plan => plan.subject))];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Functions for handling selection
  const togglePlanSelection = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const selectAllPlans = () => {
    const allCurrentPlansIds = plans.map(plan => plan.id);
    setSelectedPlans(allCurrentPlansIds);
  };

  const clearAllSelections = () => {
    setSelectedPlans([]);
  };

  const isAllSelected = plans.length > 0 && selectedPlans.length === plans.length;
  const isPartiallySelected = selectedPlans.length > 0 && selectedPlans.length < plans.length;

  const clearFilters = () => {
    setFilters({ 
      level: '', 
      subject: '', 
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">แผนการเรียนรู้ทั้งหมด</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">แผนการเรียนรู้ทั้งหมด</h1>
        <Link
          href="/create_plan"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          สร้างแผนใหม่
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">ตัวกรอง</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ค้นหา
            </label>
            <input
              type="text"
              placeholder="ค้นหาชื่อหน่วย, วิชา, ระดับ..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ระดับชั้น
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วิชา
            </label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          แสดงผล {plans.length} จากทั้งหมด {pagination?.total || 0} แผน
          {pagination && pagination.total > 0 && (
            <span className="ml-2">
              (หน้า {pagination.page} จาก {pagination.totalPages})
            </span>
          )}
        </div>
      </div>

      {/* Sorting and Bulk Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">เรียงโดย:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">วันที่สร้าง</option>
            <option value="updated_at">วันที่แก้ไข</option>
            <option value="unit_name">ชื่อหน่วย</option>
            <option value="subject">วิชา</option>
            <option value="level">ระดับชั้น</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">ล่าสุดก่อน</option>
            <option value="asc">เก่าก่อน</option>
          </select>
        </div>



      </div>

      {/* Selection Controls */}
      {plans.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected;
                }}
                onChange={() => isAllSelected ? clearAllSelections() : selectAllPlans()}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                เลือกทั้งหมดในหน้านี้
              </span>
            </label>
            {selectedPlans.length > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                เลือกแล้ว {selectedPlans.length} แผน
              </span>
            )}
          </div>
          
          {selectedPlans.length > 0 && (
            <button
              onClick={clearAllSelections}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ยกเลิกการเลือกทั้งหมด
            </button>
          )}
        </div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {pagination?.total === 0 && allPlansForFilters.length > 0 
              ? 'ไม่พบแผนการเรียนรู้ที่ตรงกับเงื่อนไขการค้นหา' 
              : 'ยังไม่มีแผนการเรียนรู้'}
          </div>
          {pagination?.total === 0 && allPlansForFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan: LessonPlan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 right-4 z-10">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPlans.includes(plan.id)}
                      onChange={() => togglePlanSelection(plan.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                    />
                  </label>
                </div>

                {/* Image thumbnail */}
                {plan.images && plan.images.length > 0 && (
                  <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={plan.images[0].url}
                      alt={plan.images[0].alt || plan.unit_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {plan.level}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(plan.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {plan.unit_name}
                  </h3>
                  
                  <p className="text-gray-600 mb-2">
                    <strong>วิชา:</strong> {plan.subject}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    <strong>จุดประสงค์:</strong> {plan.objectives.join(', ')}
                  </p>
                  
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {plan.activities.length} กิจกรรม
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/plan/${plan.id}`}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        📄 ดู
                      </Link>
                      <button
                        onClick={() => handleDelete(plan.id, plan.unit_name)}
                        disabled={deleteLoading === plan.id}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === plan.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          '🗑️'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← ก่อนหน้า
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ถัดไป →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
