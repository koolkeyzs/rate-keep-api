import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [label, setLabel] = useState('');
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [usage, setUsage] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [liveConnected, setLiveConnected] = useState(false);
  const [error, setError] = useState('');
  const eventSourceRef = useRef(null);

  const fetchKeys = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/keys`);
      setKeys(res.data);
    } catch {
      setError('Could not load API keys.');
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/keys`, { label });
      setLabel('');
      await fetchKeys();
    } catch {
      setError('Could not create key. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const fetchUsage = async (key) => {
    setSelectedKey(key);
    setUsageLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/keys/${key}/usage`);
      setUsage(res.data);
    } catch {
      setError('Could not load usage for this key.');
    } finally {
      setUsageLoading(false);
    }
  };

  const handleDownloadCsv = (key) => {
    window.open(`${API_URL}/api/usage/${key}/csv`, '_blank');
  };

  const startLiveFeed = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setLiveEvents([]);
    const es = new EventSource(`${API_URL}/api/usage/live`);
    es.onopen = () => setLiveConnected(true);
    es.onerror = () => setLiveConnected(false);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveEvents((prev) => [data, ...prev].slice(0, 20));
    };
    eventSourceRef.current = es;
  };

  const stopLiveFeed = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setLiveConnected(false);
  };

  const chartData = [...usage]
    .reverse()
    .map((log, i) => ({ index: i + 1, time: new Date(log.timestamp).toLocaleTimeString() }));

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">Ratekeep</div>
        <div className="tagline">API keys, rate limits, and usage in one place</div>
      </header>

      <div className="layout">
        {/* LEFT RAIL */}
        <aside className="rail">
          <section className="panel">
            <h2 className="panelTitle">New key</h2>
            <form onSubmit={handleCreateKey} className="keyForm">
              <input
                type="text"
                placeholder="Label, e.g. mobile app"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="input"
                required
              />
              <button type="submit" className="button" disabled={creating}>
                {creating ? 'Creating…' : 'Generate key'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h2 className="panelTitle">Your keys</h2>
            {keysLoading ? (
              <div className="skeletonList">
                <div className="skeletonRow" />
                <div className="skeletonRow" />
              </div>
            ) : keys.length === 0 ? (
              <p className="empty">No keys yet. Generate one above to get started.</p>
            ) : (
              <ul className="keyList">
                {keys.map((k) => (
                  <li key={k.key} className={`keyItem ${selectedKey === k.key ? 'keyItemActive' : ''}`}>
                    <button className="keyButton" onClick={() => fetchUsage(k.key)}>
                      <span className="keyLabel">{k.label}</span>
                      <span className="mono keyValue">{k.key.slice(0, 10)}…</span>
                      <span className="keyCount">{k.requestCount} req</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        {/* MAIN */}
        <main className="main">
          {error && <p className="error">{error}</p>}

          {!selectedKey ? (
            <div className="placeholder">
              <p>Select a key from the left to see its usage, export logs, or watch requests arrive live.</p>
            </div>
          ) : (
            <>
              <section className="panel">
                <div className="panelHeader">
                  <h2 className="panelTitle">Usage — <span className="mono">{selectedKey.slice(0, 14)}…</span></h2>
                  <button className="buttonSecondary" onClick={() => handleDownloadCsv(selectedKey)}>
                    Export CSV
                  </button>
                </div>

                {usageLoading ? (
                  <div className="skeletonList">
                    <div className="skeletonRow" />
                    <div className="skeletonRow" />
                    <div className="skeletonRow" />
                  </div>
                ) : usage.length === 0 ? (
                  <p className="empty">No requests logged yet for this key.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="index" stroke="#8B93A7" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#8B93A7" allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: '#171B22', border: '1px solid #262B35', borderRadius: 6, color: '#E7E9EE' }}
                        />
                        <Line type="monotone" dataKey="index" stroke="#D9A441" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Endpoint</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usage.slice(0, 8).map((log) => (
                          <tr key={log._id} className="row">
                            <td className="mono">{log.endpoint}</td>
                            <td className="mono muted">{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </section>

              <section className="panel">
                <div className="panelHeader">
                  <h2 className="panelTitle">Live requests</h2>
                  <div className="liveControls">
                    <span className={`statusDot ${liveConnected ? 'statusOn' : 'statusOff'}`} />
                    {liveConnected ? (
                      <button className="buttonSecondary" onClick={stopLiveFeed}>Stop</button>
                    ) : (
                      <button className="buttonSecondary" onClick={startLiveFeed}>Watch live</button>
                    )}
                  </div>
                </div>

                {liveEvents.length === 0 ? (
                  <p className="empty">
                    {liveConnected ? 'Connected. Waiting for requests…' : 'Start watching, then hit the API to see requests arrive here in real time.'}
                  </p>
                ) : (
                  <ul className="liveList">
                    {liveEvents.map((ev, i) => (
                      <li key={i} className="liveItem">
                        <span className="mono">{ev.endpoint}</span>
                        <span className="mono muted">{new Date(ev.time).toLocaleTimeString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;