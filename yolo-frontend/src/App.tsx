import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import githubIcon from "./assets/github-142-svgrepo-com.svg";
import gmailIcon from "./assets/gmail-svgrepo-com.svg";
import instagramIcon from "./assets/instagram-1-svgrepo-com.svg";

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detectionData, setDetectionData] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/detect");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const imgData = `data:image/jpeg;base64,${data.frame}`;
      setImageSrc(imgData);
      setIsLoading(false);

      const countsArray = Object.entries(data.counts).map(([name, count]) => ({
        name,
        count: count as number,
      }));
      setDetectionData(countsArray);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket Connection Closed");
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kolom Gambar */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="spinner"></div>
                  <p className="text-lg text-gray-400">Membuka kamera...</p>
                </div>
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Detected Objects"
                  className="border-4 border-white rounded-lg shadow-2xl w-full transform transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <p className="text-center text-lg text-gray-400">Kamera tidak dapat diakses.</p>
              )}
            </div>
          </div>

          {/* Kolom Grafik */}
          <div className="md:col-span-1">
            {!isLoading && detectionData.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 text-white">Statistik Objek</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={detectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="name" stroke="#CBD5E0" />
                    <YAxis stroke="#CBD5E0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2D3748',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                      }}
                    />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Kolom Kontak */}
          <div className="md:col-span-3 lg:col-span-1">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="space-y-4">
                <a
                  href="mailto:syukrieyansyah@gmail.com"
                  className="flex items-center space-x-2 hover:text-white transition-colors duration-300"
                >
                  <img src={gmailIcon} alt="Gmail Icon" width="24" height="24" />
                  <span>syukrieyansyah@gmail.com</span>
                </a>
                <a
                  href="https://instagram.com/syukrieyansyah"
                  className="flex items-center space-x-2 hover:text-white transition-colors duration-300"
                >
                  <img src={instagramIcon} alt="Instagram Icon" width="24" height="24" />
                  <span>syukrieyansyah</span>
                </a>
                <a
                  href="https://github.com/syukriyansyah"
                  className="flex items-center space-x-2 hover:text-white transition-colors duration-300"
                >
                  <img src={githubIcon} alt="Github Icon" width="24" height="24" />
                  <span>syukriyansyah</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS untuk Custom Spinner */}
      <style>
        {`
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid #4F46E5;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}