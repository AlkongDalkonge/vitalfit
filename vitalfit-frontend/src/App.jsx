import { BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
      <ToastContainer position="top-center" autoClose={3000} />;
    </BrowserRouter>
  );
}
