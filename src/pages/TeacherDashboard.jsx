import React, { useState } from 'react';
import { LayoutDashboard, Users, PlusCircle, FileText, ClipboardCheck, AlertTriangle } from 'lucide-react';

import OverviewTab from '../features/teacher-dashboard/OverviewTab';
import StudentsTab from '../features/teacher-dashboard/StudentsTab';
import CreateAssignmentTab from '../features/teacher-dashboard/CreateAssignmentTab';
import ManageAssignmentsTab from '../features/teacher-dashboard/ManageAssignmentsTab';
import GradeTab from '../features/teacher-dashboard/GradeTab';
import CheatsTab from '../features/teacher-dashboard/CheatsTab';

// ===== TEACHER DASHBOARD - Tab Navigation =====
export const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Danh sách HS', icon: Users },
    { id: 'create', label: 'Tạo bài tập', icon: PlusCircle },
    { id: 'manage', label: 'Quản lý BT', icon: FileText },
    { id: 'grade', label: 'Chấm điểm', icon: ClipboardCheck },
    { id: 'cheats', label: 'Gian lận', icon: AlertTriangle },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/25">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bảng Điều Khiển Giáo Viên</h1>
          <p className="text-sm text-gray-500">Quản lý lớp học, bài tập & chấm điểm</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-800 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
              {tab.id === 'cheats' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'create' && <CreateAssignmentTab />}
      {activeTab === 'manage' && <ManageAssignmentsTab />}
      {activeTab === 'grade' && <GradeTab />}
      {activeTab === 'cheats' && <CheatsTab />}
    </div>
  );
};
