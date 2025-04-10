import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ObjectDetection() {
  const [detections, setDetections] = useState([]);
  const [filter, setFilter] = useState(["house", "motorcycle", "car", "truck", "cloud", "mountain", "plant"]);
  const [history, setHistory] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [visitorCountries, setVisitorCountries] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/detect");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDetections(data.filter(d => filter.includes(d.class)));
    };
    return () => ws.close();
  }, [filter]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/detection-history")
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/visitor-stats")
      .then(res => res.json())
      .then(data => {
        setVisitorCount(data.count);
        setVisitorCountries(data.countries);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Real-time Object Detection</h1>
      <div className="flex gap-4">
        <div className="flex-1">
          <video autoPlay className="w-full bg-gray-200"></video>
          <div className="mt-2 flex flex-wrap gap-2">
            {detections.map((d, index) => (
              <Card key={index} className="p-2">
                <CardContent>
                  <p>{d.class}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="w-1/3">
          <h2 className="text-lg font-semibold">Detection History</h2>
          <div className="mt-2">
            {history.map((h, idx) => (
              <Card key={idx} className="mb-2">
                <CardContent>
                  <p>{new Date(h.timestamp).toLocaleString()}</p>
                  {h.detections.map((det, i) => (
                    <span key={i} className="block text-sm">{det.class}</span>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-4" onClick={() => setFilter([])}>Clear Filters</Button>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Visitor Statistics</h2>
        <p>Total Visitors: {visitorCount}</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitorCountries}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
