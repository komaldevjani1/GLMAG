import React, { useState, useCallback } from 'react';
import { Upload, Search, CheckCircle, AlertCircle, FileText, User, Mail, Building, ChevronRight, X } from 'lucide-react';

// Firebase configuration (as specified in PRD)
const firebaseConfig = {
  apiKey: "AIzaSyCNxFJ0X280PDYSmoM-cDOvu-_iJkhPG8k",
  authDomain: "glcodemag.firebaseapp.com",
  projectId: "glcodemag",
  storageBucket: "glcodemag.firebasestorage.app",
  messagingSenderId: "517541696957",
  appId: "1:517541696957:web:8c28bd1bc714c964be6ed4",
  measurementId: "G-46R5LGL8F1"
};

const DeductionDecoder = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileResults, setFileResults] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    company: '',
    code: '',
    distributor: '',
    revenue: '',
    automation: false,
    challenge: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [inputMode, setInputMode] = useState('code'); // 'code' or 'upload'
  const [uploadAccess, setUploadAccess] = useState(false);
  const [uploadCredentials, setUploadCredentials] = useState({ email: '', company: '' });

  // Search for deduction code
  const searchDeductionCode = async (code) => {
    if (!code.trim()) return;
    
    setLoading(true);
    setSearchAttempts(prev => prev + 1);
    
    // Sample data for testing while API is being fixed
    const sampleData = {
      'COOP': { code: 'COOP', description: 'Cooperative Advertising', disputability: 'Disputable if incorrect', company: 'UNFI', category: 'Marketing' },
      'SHORT': { code: 'SHORT', description: 'Short Shipment', disputability: 'Disputable', company: 'KeHE', category: 'Logistics' },
      'ALLOW': { code: 'ALLOW', description: 'Trade Allowance', disputability: 'Not disputable', company: 'C&S', category: 'Trade' },
      'DAMAGE': { code: 'DAMAGE', description: 'Product Damage', disputability: 'Case-by-case', company: 'McLane', category: 'Quality' }
    };
    
    try {
      const prefix = code.substring(0, 6).toUpperCase();
      const endpoint = `https://script.google.com/macros/s/AKfycbyGKvx9vShC9QpZib2LbY2FPJ1BU-CLs7x_EeFCja9REriTMVNFI7UAdVSNZgBzhQosrA/exec?prefix=${encodeURIComponent(prefix)}`;
      
      console.log('🔍 Searching for:', prefix);
      console.log('🌐 API Endpoint:', endpoint);
      
      const response = await fetch(endpoint);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response OK:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Raw API response:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Is Array?', Array.isArray(data));
      
      if (data && Array.isArray(data) && data.length > 0) {
        const [match] = data;
        console.log('✅ Match found:', match);
        setSearchResult({
          code: match.code || match.Code || code.toUpperCase(),
          description: match.description || match.Description || '—',
          disputability: match.disputability || match.Disputability || '—',
          company: match.company || match.Company || '—',
          category: match.category || match.Category || '—'
        });
      } else {
        throw new Error('No data returned from API');
      }
    } catch (error) {
      console.error('🚨 API Error:', error);
      console.log('🔄 Falling back to sample data...');
      
      // Check sample data as fallback
      const sampleMatch = sampleData[code.toUpperCase()];
      if (sampleMatch) {
        console.log('✅ Sample data match found:', sampleMatch);
        setSearchResult(sampleMatch);
      } else {
        console.log('❌ No match in sample data either');
        setSearchResult({
          notFound: true,
          searchedCode: code.trim(),
          message: `No match found for "${code.trim()}". Try: COOP, SHORT, ALLOW, or DAMAGE (sample data) or contact us for help.`
        });
      }
    }
    setLoading(false);
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    
    setUploadedFile(file);
    setLoading(true);
    
    try {
      // For MVP, we'll simulate file processing
      // In production, you'd parse the file and extract codes
      setTimeout(() => {
        // Simulate no matches found scenario for demo
        setFileResults({
          fileName: file.name,
          totalCodes: 0,
          disputableCodes: 0,
          codes: []
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('File upload error:', error);
      setLoading(false);
    }
  }, []);

  // Handle upload access request
  const handleUploadAccess = async () => {
    if (!uploadCredentials.email || !uploadCredentials.company) return;
    
    try {
      const formData = new FormData();
      formData.append('email', uploadCredentials.email);
      formData.append('company', uploadCredentials.company);
      formData.append('_subject', 'File Upload Access Request - Deduction Decoder');
      formData.append('_captcha', 'false');
      
      await fetch('https://formsubmit.co/komal@gorevya.com', {
        method: 'POST',
        body: formData
      });
      
      setUploadAccess(true);
    } catch (error) {
      console.error('Access request error:', error);
    }
  };
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', leadFormData.name);
      formData.append('email', leadFormData.email);
      formData.append('company', leadFormData.company);
      formData.append('code', leadFormData.code);
      formData.append('distributor', leadFormData.distributor);
      formData.append('revenue', leadFormData.revenue);
      formData.append('automation', leadFormData.automation);
      formData.append('challenge', leadFormData.challenge);
      formData.append('_subject', 'New Deduction Decoder Lead');
      formData.append('_captcha', 'false');
      
      await fetch('https://formsubmit.co/komal@gorevya.com', {
        method: 'POST',
        body: formData
      });
      
      setShowLeadModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getDisputabilityColor = (disputability) => {
    if (!disputability) return 'bg-gray-100 text-gray-600';
    const lower = disputability.toLowerCase();
    if (lower.includes('disputable') && !lower.includes('not')) {
      return 'bg-red-50 text-red-700 border border-red-200';
    } else if (lower.includes('case-by-case')) {
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    } else {
      return 'bg-green-50 text-green-700 border border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#FAFAFC' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revya</h1>
              <p className="text-sm text-gray-600 mt-1">Deduction Decoder</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Instant Code Analysis</p>
              <p className="text-xs text-gray-500">For CPG Finance Teams</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Decode Your Deduction Codes Instantly
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understand distributor deduction codes, identify disputable charges, and take action to recover revenue.
          </p>
        </div>

        {/* Input Methods */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            {/* Toggle Tabs */}
            <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setInputMode('code')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  inputMode === 'code' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Search by Code
              </button>
              <button
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  inputMode === 'upload' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
            </div>

            {/* Manual Code Entry */}
            {inputMode === 'code' && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Search className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Search by Code</h3>
                    <p className="text-sm text-gray-600">Enter a deduction code to decode instantly</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter code (e.g., COOP, A030, SHORT)"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                      onKeyPress={(e) => e.key === 'Enter' && searchDeductionCode(searchCode)}
                    />
                  </div>
                  <button
                    onClick={() => searchDeductionCode(searchCode)}
                    disabled={loading || !searchCode.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    style={{ backgroundColor: '#6C12ED' }}
                  >
                    {loading ? 'Searching...' : 'Decode Now'}
                  </button>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowNDAModal(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Get Full Analysis Report
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Upload files for bulk code analysis
                    </p>
                  </div>
                </div>

                {/* Search Result */}
                {searchResult && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    {searchResult.notFound ? (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-4">{searchResult.message}</p>
                        <button
                          onClick={() => {
                            setLeadFormData(prev => ({ ...prev, code: searchResult.searchedCode }));
                            setShowLeadModal(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-xl transition-colors text-sm"
                          style={{ backgroundColor: '#6C12ED' }}
                        >
                          Submit Code for Review
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{searchResult.code}</h4>
                            <p className="text-gray-600">{searchResult.description}</p>
                            {searchResult.company && (
                              <p className="text-sm text-gray-500 mt-1">Company: {searchResult.company}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDisputabilityColor(searchResult.disputability)}`}>
                            {searchResult.disputability || 'Unknown'}
                          </span>
                        </div>
                        {searchResult.disputability && searchResult.disputability.toLowerCase().includes('disputable') && !searchResult.disputability.toLowerCase().includes('not') && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">💡 This deduction may be disputable!</p>
                            <button
                              onClick={() => setShowLeadModal(true)}
                              className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Get help disputing this charge →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File Upload Access Modal */}
            {inputMode === 'upload' && !uploadAccess && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
                   onClick={(e) => { if (e.target === e.currentTarget) setInputMode('code'); }}>
                <div className="bg-white rounded-2xl max-w-lg w-full p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Confidentiality Agreement</h3>
                    <button
                      onClick={() => setInputMode('code')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <p className="text-gray-700">
                      To protect your sensitive business information, we require a brief confidentiality agreement before providing detailed analysis reports.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                      <h4 className="font-medium text-gray-900 mb-2">This agreement ensures:</h4>
                      <ul className="space-y-1">
                        <li>• Your deduction data remains confidential</li>
                        <li>• Information is only used to help your business</li>
                        <li>• No sharing with third parties without permission</li>
                        <li>• Secure handling of all uploaded files</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Work email"
                        value={uploadCredentials.email}
                        onChange={(e) => setUploadCredentials(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Company name"
                        value={uploadCredentials.company}
                        onChange={(e) => setUploadCredentials(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="upload-nda-accept"
                        checked={ndaAccepted}
                        onChange={(e) => setNdaAccepted(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                      />
                      <label htmlFor="upload-nda-accept" className="ml-2 text-sm text-gray-700">
                        I agree to the confidentiality terms and authorize Revya to analyze my deduction data for the purpose of providing business insights.
                        <a href="https://www.revya.ai/mnda" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline ml-1">
                          View full mNDA
                        </a>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setInputMode('code')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (ndaAccepted && uploadCredentials.email && uploadCredentials.company) {
                          handleUploadAccess();
                        }
                      }}
                      disabled={!ndaAccepted || !uploadCredentials.email || !uploadCredentials.company}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                      style={{ backgroundColor: (ndaAccepted && uploadCredentials.email && uploadCredentials.company) ? '#6C12ED' : undefined }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Interface */}
            {inputMode === 'upload' && uploadAccess && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>
                    <p className="text-sm text-gray-600">Analyze multiple codes from CSV, Excel, or PDF</p>
                  </div>
                </div>

                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {uploadedFile ? uploadedFile.name : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">Supports CSV, XLS, XLSX, PDF</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xls,.xlsx,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => uploadedFile ? handleFileUpload(uploadedFile) : document.getElementById('file-upload').click()}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    style={{ backgroundColor: '#6C12ED' }}
                  >
                    {loading ? 'Analyzing File...' : uploadedFile ? 'Decode Now' : 'Select File to Decode'}
                  </button>
                </div>

                {fileResults && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">Analysis Results</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Codes:</span>
                          <span className="ml-2 font-medium">{fileResults.totalCodes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Disputable:</span>
                          <span className="ml-2 font-medium text-red-600">{fileResults.disputableCodes}</span>
                        </div>
                      </div>
                    </div>
                    
                    {fileResults.totalCodes === 0 && (
                      <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-900 font-medium mb-2">No matches found in your upload.</p>
                        <p className="text-gray-600 mb-4">Want our team to take a look?</p>
                        <button
                          onClick={() => setShowLeadModal(true)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
                          style={{ backgroundColor: '#6C12ED' }}
                        >
                          Get a Free Manual Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Deduction Codes Matter</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Understanding your deduction codes is the first step to recovering lost revenue and improving your trade management process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Clarity</h4>
              <p className="text-sm text-gray-600">Decode any deduction code in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Dispute Insights</h4>
              <p className="text-sm text-gray-600">Know which charges you can challenge</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Bulk Analysis</h4>
              <p className="text-sm text-gray-600">Process entire files at once</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need Help with Your Deductions?</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Our experts can help you build a systematic approach to managing and disputing deductions, potentially recovering thousands in lost revenue.
          </p>
          <button
            onClick={() => setShowLeadModal(true)}
            className="bg-white text-purple-600 font-medium py-3 px-8 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Get Expert Help
          </button>
        </div>
      </main>

      {/* NDA Modal */}
      {showNDAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confidentiality Agreement</h3>
              <button
                onClick={() => setShowNDAModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-700">
                To protect your sensitive business information, we require a brief confidentiality agreement before providing detailed analysis reports.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">This agreement ensures:</h4>
                <ul className="space-y-1">
                  <li>• Your deduction data remains confidential</li>
                  <li>• Information is only used to help your business</li>
                  <li>• No sharing with third parties without permission</li>
                  <li>• Secure handling of all uploaded files</li>
                </ul>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="nda-accept"
                  checked={ndaAccepted}
                  onChange={(e) => setNdaAccepted(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                />
                <label htmlFor="nda-accept" className="ml-2 text-sm text-gray-700">
                  I agree to the confidentiality terms and authorize Revya to analyze my deduction data for the purpose of providing business insights.
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowNDAModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (ndaAccepted) {
                    setShowNDAModal(false);
                    setShowLeadModal(true);
                  }
                }}
                disabled={!ndaAccepted}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                style={{ backgroundColor: ndaAccepted ? '#6C12ED' : undefined }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          onClick={(e) => { if (e.target === e.currentTarget) setShowLeadModal(false); }}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Get Expert Help</h3>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadFormData.company}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      value={leadFormData.code}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm"
                      placeholder="Deduction code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distributor
                    </label>
                    <select
                      value={leadFormData.distributor}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, distributor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select</option>
                      <option value="UNFI">UNFI</option>
                      <option value="KeHE">KeHE</option>
                      <option value="C&S">C&S</option>
                      <option value="McLane">McLane</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="automation"
                    checked={leadFormData.automation}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, automation: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="automation" className="ml-2 text-sm text-gray-700">
                    Interested in automating deduction recovery?
                  </label>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  We'll never sell your data. You'll hear from a real human. ✓
                  <br />
                  <a href="https://www.revya.ai/mnda" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                    View our mNDA
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleLeadSubmit}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
                  style={{ backgroundColor: '#6C12ED' }}
                >
                  Send to Our Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Submitted!</h3>
            <p className="text-gray-600 mb-8">
              Our team will review your request and get back to you within 24 hours.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.open('https://calendly.com/komal-gorevya/30min', '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
                style={{ backgroundColor: '#6C12ED' }}
              >
                Book a Demo
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Revya. Helping CPG brands recover revenue through better deduction management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeductionDecoder;