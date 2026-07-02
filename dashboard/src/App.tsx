import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import PerformanceReport from '@reports/PerformanceReport';
import CostAnalysisReport from '@reports/CostAnalysisReport';
import ConversionReport from '@reports/ConversionReport';
import CompetitorReport from '@reports/CompetitorReport';
import AudienceReport from '@reports/AudienceReport';
import { generateMockPerformanceData, generateMockAlerts, generateMockCompetitors } from '@utils/dataTransformers';
import type { PerformanceData } from '@/types';

const NAV_ITEMS = [
  { path: '/', label: 'الأداء', icon: '📊', element: 'performance' },
  { path: '/cost', label: 'التكلفة', icon: '💰', element: 'cost' },
  { path: '/conversions', label: 'التحويلات', icon: '✅', element: 'conversions' },
  { path: '/competitors', label: 'المنافسون', icon: '🏢', element: 'competitors' },
  { path: '/audience', label: 'الجمهور', icon: '👥', element: 'audience' },
];

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>📈</span>
        <span>منصة التسويق الإلكتروني</span>
      </div>
      <ul className="navbar-nav">
        {NAV_ITEMS.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function App() {
  const [mockData] = useState<PerformanceData[]>(() => generateMockPerformanceData(30));
  const [loading] = useState(false);
  const mockCompetitors = generateMockCompetitors();
  const mockAlerts = generateMockAlerts();

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={
            <>
              <div className="page-header">
                <h1>📊 تقرير الأداء الشامل</h1>
                <p>ملخص أداء المنصات والحملات الإعلانية</p>
              </div>
              <PerformanceReport data={mockData} loading={loading} />
            </>
          } />
          <Route path="/cost" element={
            <>
              <div className="page-header">
                <h1>💰 تحليل التكلفة</h1>
                <p>تحليل تكلفة الإعلان عبر المنصات والفترات</p>
              </div>
              <CostAnalysisReport data={mockData} loading={loading} />
            </>
          } />
          <Route path="/conversions" element={
            <>
              <div className="page-header">
                <h1>✅ تقرير التحويلات</h1>
                <p>تحليل التحويلات وتكلفة الاكتساب</p>
              </div>
              <ConversionReport data={mockData} loading={loading} />
            </>
          } />
          <Route path="/competitors" element={
            <>
              <div className="page-header">
                <h1>🏢 تقرير المنافسين</h1>
                <p>مقارنة الأداء مع المنافسين في السوق</p>
              </div>
              <CompetitorReport data={mockCompetitors} loading={loading} />
            </>
          } />
          <Route path="/audience" element={
            <>
              <div className="page-header">
                <h1>👥 تقرير الجمهور</h1>
                <p>تحليل ديموغرافي وجغرافي للجمهور المستهدف</p>
              </div>
              <AudienceReport loading={loading} />
            </>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
