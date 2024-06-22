import React, { useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ImageProcessing.css';
import '../styles/App.css'; // Import the additional CSS file

function ImageProcessing() {
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setLoading(true);
      setError(null);
      setShowNoResults(false);

      try {
        const image = document.getElementById('uploaded-image');
        const model = await mobilenet.load();
        const predictions = await model.classify(image);
        const products = await fetchAmazonProducts(predictions[0].className);
        setResults(products);
        if (products.length === 0) {
          setShowNoResults(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAmazonProducts = async (query) => {
    try {
      const response = await axios.get('http://localhost:3001/search', {
        params: { query },
      });
      return response.data.products.slice(0, 10);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <h2 className="mb-4">Image Search</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="form-group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="form-control-file" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Search</button>
        </form>
        {imageSrc && (
          <div className="text-center mt-4 mb-3">
            <img id="uploaded-image" src={imageSrc} alt="Uploaded" className="img-fluid" style={{ maxHeight: '400px' }} />
          </div>
        )}
        {loading && <div className="alert alert-info">Loading...</div>}
        {error && <div className="alert alert-danger">Error: {error}</div>}
        {results && results.length > 0 && (
          <div>
            <h3 className="mb-4">Recommendations:</h3>
            <div className="row">
              {results.slice(0, 7).map((result, index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div className="card-container">
                    <div className="card-flip">
                      <div className="card front">
                        <img src={result.thumbnail} alt={result.title} className="card-img-top" />
                      </div>
                      <div className="card back">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{result.title}</h5>
                          <p className="card-text">Price: {result.price}</p>
                          <a href={result.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-auto">View the product</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {results && results.length === 0 && showNoResults && (
          <div className="alert alert-warning">No results found</div>
        )}
      </div>
    </div>
  );
}

export default ImageProcessing;
