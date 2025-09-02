import React, { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./index.css";

const LOGIN_URL = "http://localhost:3000/login";
const UPLOAD_URL = "http://localhost:3000/upload";
const SCANS_URL = "http://localhost:3000/scans";

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await axios.post(LOGIN_URL, { email, password });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.role);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const TechnicianDashboard = () => {
    const [patientName, setPatientName] = useState("");
    const [patientId, setPatientId] = useState("");
    const [scanType, setScanType] = useState("Intraoral Scan");
    const [region, setRegion] = useState("Full Mouth");
    const [scanImage, setScanImage] = useState(null);

    const handleUpload = async (e) => {
      e.preventDefault();
      setMessage("");
      setError("");

      if (!scanImage) {
        setError("Please select a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("patientName", patientName);
      formData.append("patientId", patientId);
      formData.append("scanType", scanType);
      formData.append("region", region);
      formData.append("scanImage", scanImage);

      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(UPLOAD_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage(response.data.message);
        // Reset form
        setPatientName("");
        setPatientId("");
        setScanImage(null);
        document.getElementById("scanImage").value = "";
      } catch (err) {
        setError("Upload failed. Please try again.");
        console.error(err);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Technician Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                  placeholder="A123-456"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scan Type
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                >
                  <option>Intraoral Scan</option>
                  <option>CBCT Scan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                >
                  <option>Full Mouth</option>
                  <option>Upper Arch</option>
                  <option>Lower Arch</option>
                  <option>Specific Teeth</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dental Scan Image
              </label>
              <input
                type="file"
                id="scanImage"
                onChange={(e) => setScanImage(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Upload Scan
            </button>
          </form>

          {message && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-center"
              role="alert"
            >
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DentistDashboard = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedScan, setSelectedScan] = useState(null);

    useEffect(() => {
      const fetchScans = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(SCANS_URL, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setScans(response.data);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch scans. Please try again.");
          setLoading(false);
          console.error(err);
        }
      };
      fetchScans();
    }, []);

    const generatePdf = async (scan) => {
      const input = document.getElementById(`scan-card-${scan.id}`);
      const pdf = new jsPDF("p", "pt", "a4");

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 595; // A4 width in pt
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`report-${scan.patientId}.pdf`);
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center text-gray-600">
          Loading scans...
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center text-red-600">
          {error}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Dentist Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {scans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {scans.map((scan) => (
              <div
                key={scan.id}
                id={`scan-card-${scan.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105"
              >
                <img
                  src={scan.imageUrl}
                  alt={`Scan of ${scan.patientName}`}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedScan(scan)}
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {scan.patientName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Patient ID:</span>{" "}
                    {scan.patientId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Scan Type:</span>{" "}
                    {scan.scanType}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Region:</span> {scan.region}
                  </p>
                  <p className="text-xs text-gray-400">
                    Uploaded: {new Date(scan.uploadDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => generatePdf(scan)}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            No scans found.
          </div>
        )}

        {selectedScan && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50"
            onClick={() => setSelectedScan(null)}
          >
            <div
              className="relative bg-white rounded-xl shadow-xl p-6 max-w-4xl max-h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedScan(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
              <img
                src={selectedScan.imageUrl}
                alt={`Full scan of ${selectedScan.patientName}`}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedScan.patientName}
                </h3>
                <p className="text-gray-600">
                  Patient ID: {selectedScan.patientId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {!user && (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-8 space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">
              OralVis Healthcare
            </h1>
            <p className="text-center text-gray-500">Sign in to your account</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tech@oralvis.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Sign In
              </button>
            </form>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {user === "Technician" && <TechnicianDashboard />}
      {user === "Dentist" && <DentistDashboard />}
    </>
  );
};

export default App;