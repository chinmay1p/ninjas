import React, { useState, useRef } from 'react';
import './p1.css';
import './p2.css';

export default function Page1() {
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = () => {
    console.log("Submitted file:", fileName);
  };

  return (
    <>
    <div className="upload-container">
      <div className="upload-wrapper">
        <div className="upload-description">
          <h1>Smart Analysis,<br />Smarter Decisions</h1>
          <p>Upload your financial report and unlock deep insights instantly. Transform raw numbers into strategic intelligence.</p>
        </div>

        <div className="upload-section">
          <div 
            onClick={handleFileSelect} 
            className="file-drop-zone"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf"
              className="file-input" 
              onChange={handleFileChange} 
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="upload-icon"
            >
              <path d="M21.2 15.2l-1.4 1.4c-.4.4-1 .4-1.4 0L8 7.4V12h-2V4h8v2h-4.6l8.8 8.8c.4.4.4 1 0 1.4zM3 3l18 18m-9-5v4h4v-4h-4z" />
              <path d="M14 4v6.88l4 4"/>
            </svg>
            <p className="text-gray-300">
              {fileName ? fileName : "Click to upload PDF report"}
            </p>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={!fileName}
            className="submit-button"
          >
            <span>Analyze Report</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
            </svg>
          </button>
        </div>
      </div>
    </div>


    <div className="output-container">
    <div className='output'>
      <div className="output-header">
          <h2>Financial Analysis</h2>
          <p>Comprehensive overview of financial performance</p>
      </div>
      
      <div className="output-grid">
          <div className="data-card">
              <div className="card-header">
                  <div className="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 21H3V3h18v18z"/>
                          <path d="M7 14l3-3 4 4 3-3"/>
                      </svg>
                  </div>
                  <h3 className="card-title">Standalone Data</h3>
              </div>
              
              <div className="metric-grid">
                  <div className="metric-item">
                      <div className="metric-label">Revenue</div>
                      <div className="metric-value">
                          <span id="sta-rev"></span>
                          <span className="trend-indicator positive">+12.5%</span>
                      </div>
                  </div>
                  
                  <div className="metric-item">
                      <div className="metric-label">Operating Profit</div>
                      <div className="metric-value">
                          <span id="sta-op"></span>
                          <span className="trend-indicator positive">+8.3%</span>
                      </div>
                  </div>
                  
                  <div className="metric-item">
                      <div className="metric-label">Net Profit</div>
                      <div className="metric-value">
                          <span id="sta-np"></span>
                          <span className="trend-indicator positive">+5.7%</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="data-card">
              <div className="card-header">
                  <div className="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 12V7H3v10h18v-5z"/>
                          <path d="M3 7l9-4 9 4"/>
                      </svg>
                  </div>
                  <h3 className="card-title">Consolidated Data</h3>
              </div>
              
              <div className="metric-grid">
                  <div className="metric-item">
                      <div className="metric-label">Revenue</div>
                      <div className="metric-value">
                          <span id="con-rev"></span>
                          <span className="trend-indicator positive">+15.2%</span>
                      </div>
                  </div>
                  
                  <div className="metric-item">
                      <div className="metric-label">Operating Profit</div>
                      <div className="metric-value">
                          <span id="con-op"></span>
                          <span className="trend-indicator positive">+10.1%</span>
                      </div>
                  </div>
                  
                  <div className="metric-item">
                      <div className="metric-label">Net Profit</div>
                      <div className="metric-value">
                          <span id="con-np"></span>
                          <span className="trend-indicator positive">+7.8%</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      </div>



  <div className="loader"></div>

</div>


    </>
  );
}