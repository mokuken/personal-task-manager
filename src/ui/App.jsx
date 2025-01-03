import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TaskTracker from './pages/TaskTracker';
import HabitTracker from './pages/HabitTracler';
import './App.css'

function App() {
  return (
    <>
        <Navigation />
        <main>
          <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/TaskTracker' element={<TaskTracker />} />
                <Route path='/Calendar' element={<Calendar />} />
                <Route path='/HabitTracker' element={<HabitTracker />} />
          </Routes>
        </main>
    </>
  )
}

export default App