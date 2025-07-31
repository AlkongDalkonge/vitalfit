import { BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
