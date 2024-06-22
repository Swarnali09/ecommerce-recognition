import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1 className="mb-4">Enhanced Shopping Experience Prototype</h1>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Link to="/search" className="btn btn-primary btn-lg btn-block mb-3">Image Search</Link>
          </div>
          <div className="col-md-6">
            <Link to="/video" className="btn btn-primary btn-lg btn-block mb-3">Video Processing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
