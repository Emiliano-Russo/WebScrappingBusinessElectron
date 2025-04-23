import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Menu } from './screens/Menu/Menu';
import { Panel } from './screens/Huangali/Panel';
import { Product } from './screens/Huangali/Product';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/huangali" element={<Panel />} />
        <Route path="/huangali/:league" element={<Product />} />
      </Routes>
    </Router>
  );
}
