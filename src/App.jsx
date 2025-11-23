import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EventCreate from './pages/EventCreate';
import EventView from './pages/EventView';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EventCreate />} />
        <Route path="/event/:eventId" element={<EventView />} />
      </Routes>
    </Layout>
  )
}

export default App
