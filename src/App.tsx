import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useResumeStore } from './store/useResumeStore';
import ModeSelectPage from './pages/ModeSelectPage';
import StartOptionPage from './pages/StartOptionPage';
import EditorPage from './pages/EditorPage';

export default function App() {
  const loadFromStorage = useResumeStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mode-select" replace />} />
        <Route path="/mode-select" element={<ModeSelectPage />} />
        <Route path="/start-option" element={<StartOptionPage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
