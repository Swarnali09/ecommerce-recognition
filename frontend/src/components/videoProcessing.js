import React, { useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/VideoProcessing.css'; // Import the CSS file
import '../styles/App.css'; // Import the additional CSS file

function VideoProcessing() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const extractFrames = async (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frames = [];

        let currentTime = 0;
        video.currentTime = currentTime;

        video.ontimeupdate = async () => {
          if (video.currentTime >= duration) {
            resolve(frames);
            return;
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/png'));

          currentTime += 1; // Extract frame every second
          video.currentTime = currentTime;
        };

        video.onerror = (err) => {
          reject(err);
        };
      };
    });
  };

  const classifyFrames = async (frames) => {
    const model = await mobilenet.load();
    const predictions = [];

    for (const frame of frames) {
      const image = new Image();
      image.src = frame;
      await new Promise((resolve) => (image.onload = resolve));
      const prediction = await model.classify(image);
      predictions.push(prediction[0].className);
    }

    return predictions;
  };

  const fetchAmazonProducts = async (queries) => {
    try {
      const response = await axios.get('http://localhost:3001/search', {
        params: { query: queries.join(','), minResults: 7 },
      });
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setShowNoResults(false); // Reset no results message

    try {
      const frames = await extractFrames(file);
      const classifications = await classifyFrames(frames);
      const products = await fetchAmazonProducts(classifications);
      setResults(products);
      if (products.length === 0) {
        setShowNoResults(true); // Show no results message if no products found
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <h2 className="mb-4">Video Processing</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="form-group">
            <input type="file" accept="video/*" onChange={handleFileChange} className="form-control-file" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Process Video</button>
        </form>
        {loading && <div className="alert alert-info">Loading...</div>}
        {error && <div className="alert alert-danger">Error: {error}</div>}
        {results && results.length > 0 && (
          <div>
            <h3 className="mb-4">Results:</h3>
            <div className="row">
              {results.slice(5, 11).map((result, index) => (
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

export default VideoProcessing;
