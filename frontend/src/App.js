import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ImageSearch from './components/imageSearch';
import VideoProcessing from './components/videoProcessing';
import Home from './components/Home'

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<ImageSearch />} />
          <Route path="/video" element={<VideoProcessing />} />
        </Routes>
      </div>
    </Router>
  );
}

// const Home = () => {
//   return <h1>Enhanced Shopping Experience Prototype</h1>;
// }

export default App;
