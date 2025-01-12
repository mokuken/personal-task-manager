import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Kanban from './pages/Kanban';
import HabitTracker from './pages/HabitTracler';
import Finance from './pages/Finance';
import './App.css'

function App() {
  return (
    <>
        <Navigation />
        <main>
          <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/Kanban' element={<Kanban />} />
                <Route path='/Calendar' element={<Calendar />} />
                <Route path='/HabitTracker' element={<HabitTracker />} />
                <Route path='/Finance' element={<Finance />} />
          </Routes>
        </main>
    </>
  )
}

export default App