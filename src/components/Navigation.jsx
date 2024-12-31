import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = () => {
  return (
    <nav>
      <CustomLink to="/">Home</CustomLink>
      <CustomLink to="/TaskTracker">Task Tracker</CustomLink>
      <CustomLink to="/Calendar">Calendar</CustomLink>
      <CustomLink to="/HabitTracker">Habit Tracker</CustomLink>
    </nav>
  );
};

function CustomLink({ to, children }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <Link className={isActive ? 'active' : ''} to={to}>
      {children}
    </Link>
  );
}

export default Navigation;
