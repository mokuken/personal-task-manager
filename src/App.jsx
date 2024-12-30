import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import TaskTracker from './pages/TaskTracker';
import './App.css'

function App() {
  return (
    <>
        <Navigation />
        <main>
          <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/TaskTracker' element={<TaskTracker />} />
                <Route path='/Calendar' element={<Calendar />} />
          </Routes>
        </main>
    </>
  )
}

export default App