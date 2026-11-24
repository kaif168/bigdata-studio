import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { AppLayout } from '@/components/layout/AppLayout';

import { OverviewPage } from '@/pages/OverviewPage';
import { PlaygroundPage } from '@/pages/PlaygroundPage';
import { DataExplorerPage } from '@/pages/DataExplorerPage';
import { VisualAnalyticsPage } from '@/pages/VisualAnalyticsPage';
import { QueryLibraryPage } from '@/pages/QueryLibraryPage';
import { LearningHubPage } from '@/pages/LearningHubPage';
import { LearningTopicPage } from '@/pages/LearningTopicPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { MapReducePage } from '@/pages/MapReducePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SavedQueriesPage } from '@/pages/SavedQueriesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AboutPage } from '@/pages/AboutPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/explorer" element={<DataExplorerPage />} />
              <Route path="/analytics" element={<VisualAnalyticsPage />} />
              <Route path="/library" element={<QueryLibraryPage />} />
              <Route path="/learning" element={<LearningHubPage />} />
              <Route path="/learning/:topicId" element={<LearningTopicPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/mapreduce" element={<MapReducePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/saved" element={<SavedQueriesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DatabaseProvider>
    </ThemeProvider>
  );
};

export default App;
