import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { Menu } from './screens/Menu/Menu';
import Huangali from './screens/Huangali/Huangali';
import { HuangaliLeague } from './screens/Huangali/HuangaliLeague';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/huangali" element={<Huangali />} />
        <Route path="/huangali/:league" element={<HuangaliLeague />} />
      </Routes>
    </Router>
  );
}
