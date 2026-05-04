import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

function App() {
    // API CONFIG
    const API_BASE_URL = 'http://localhost:3000';

    // --- MÓDULO 1: ENDEREÇOS (AUTOCOMPLETE / GEOCODE) ---
    const [addrQuery, setAddrQuery] = useState('');
    const [addrSuggestions, setAddrSuggestions] = useState([]);
    const [geoResult, setGeoResult] = useState(null);

    const testAutocomplete = async (q) => {
        setAddrQuery(q);
        if (q.length < 3) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/autocomplete?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setAddrSuggestions(data);
        } catch (e) { console.error("Erro Autocomplete:", e); }
    };

    const testGeocode = async (suggestion) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/geocode?q=${encodeURIComponent(suggestion.value)}`);
            const data = await res.json();
            setGeoResult(data);
            setAddrSuggestions([]);
            setAddrQuery(data.label);
            setMapCenter([data.lat, data.lng]);
        } catch (e) { console.error("Erro Geocode:", e); }
    };

    // --- MÓDULO 2: LOGÍSTICA (OPTIMIZE / TRACE) ---
    const [shipments, setShipments] = useState([]);
    const [vanCapacity, setVanCapacity] = useState(15);
    const [optResult, setOptResult] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]);

    // Estados auxiliares para cadastro de aluno
    const [tempStudent, setTempStudent] = useState({ name: '', pickup: null, delivery: null, time: '07:30' });
    const [shipQueries, setShipQueries] = useState({ p: '', d: '' });
    const [shipSugg, setShipSugg] = useState({ type: null, list: [] });

    const handleShipSearch = async (q, type) => {
        setShipQueries(prev => ({ ...prev, [type]: q }));
        if (q.length < 3) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/autocomplete?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setShipSugg({ type, list: data });
        } catch (e) { console.error(e); }
    };

    const selectShipAddr = async (s, type) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/geocode?q=${encodeURIComponent(s.value)}`);
            const data = await res.json();
            setTempStudent(prev => ({ ...prev, [type === 'p' ? 'pickup' : 'delivery']: data }));
            setShipQueries(prev => ({ ...prev, [type]: data.label }));
            setShipSugg({ type: null, list: [] });
        } catch (e) { console.error(e); }
    };

    const addStudent = () => {
        if (!tempStudent.pickup || !tempStudent.delivery || !tempStudent.name) return;
        setShipments([...shipments, { ...tempStudent, id: Date.now() }]);
        setTempStudent({ name: '', pickup: null, delivery: null, time: '07:30' });
        setShipQueries({ p: '', d: '' });
    };

    const runOptimization = async () => {
        setOptResult(null);
        setShowRoute(false);
        try {
            const res = await fetch(`${API_BASE_URL}/api/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capacity: vanCapacity, shipments })
            });
            const data = await res.json();
            setOptResult(data);
        } catch (e) { console.error("Erro Optimize:", e); }
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <header>
                    <h1>Movan Dev Lab</h1>
                </header>

                {/* TESTE DE ENDEREÇOS */}
                <section className="lab-section">
                    <h3>🔍 Teste de Endereços</h3>
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Autocomplete/Geocode..." 
                            value={addrQuery}
                            onChange={(e) => testAutocomplete(e.target.value)}
                        />
                        {addrSuggestions.length > 0 && (
                            <ul className="sugg-mini">
                                {addrSuggestions.map((s, i) => (
                                    <li key={i} onClick={() => testGeocode(s)}>{s.label}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {geoResult && (
                        <div className="debug-box">
                            <small>Lat: {geoResult.lat} | Lng: {geoResult.lng}</small>
                        </div>
                    )}
                </section>

                <hr />

                {/* TESTE DE LOGÍSTICA */}
                <section className="lab-section">
                    <h3>🚐 Teste de Roteirização</h3>
                    
                    <div className="form-mini">
                        <input placeholder="Nome" value={tempStudent.name} onChange={e => setTempStudent({...tempStudent, name: e.target.value})} />
                        
                        <div className="ship-search">
                            <input placeholder="Coleta" value={shipQueries.p} onChange={e => handleShipSearch(e.target.value, 'p')} />
                            {shipSugg.type === 'p' && <ul className="sugg-mini">{shipSugg.list.map((s,i) => <li key={i} onClick={() => selectShipAddr(s, 'p')}>{s.label}</li>)}</ul>}
                        </div>

                        <div className="ship-search">
                            <input placeholder="Entrega" value={shipQueries.d} onChange={e => handleShipSearch(e.target.value, 'd')} />
                            {shipSugg.type === 'd' && <ul className="sugg-mini">{shipSugg.list.map((s,i) => <li key={i} onClick={() => selectShipAddr(s, 'd')}>{s.label}</li>)}</ul>}
                        </div>

                        <input type="time" value={tempStudent.time} onChange={e => setTempStudent({...tempStudent, time: e.target.value})} />
                        <button className="btn-secondary" onClick={addStudent}>Adicionar Aluno</button>
                    </div>

                    <div className="shipments-list">
                        <small>{shipments.length} alunos na fila</small>
                        <button className="btn-clear" onClick={() => setShipments([])}>Limpar</button>
                    </div>

                    <div className="control-group">
                        <label>Van Cap: 
                            <input type="number" style={{width: '50px'}} value={vanCapacity} onChange={e => setVanCapacity(e.target.value)} />
                        </label>
                        
                        <div className="button-stack">
                            <button 
                                className="btn-primary" 
                                onClick={runOptimization}
                                disabled={shipments.length === 0}
                            >
                                1. Otimizar Rota
                            </button>
                            
                            <button 
                                className="btn-success" 
                                onClick={() => setShowRoute(true)}
                                disabled={!optResult}
                            >
                                2. Traçar no Mapa
                            </button>
                        </div>
                    </div>

                    {optResult && (
                        <div className="debug-box scrollable">
                            <strong>Status: Otimizado!</strong>
                            <p>Dist: {optResult.totalDistance}m</p>
                            <pre>{JSON.stringify(optResult.optimizedSequence, null, 2)}</pre>
                        </div>
                    )}
                </section>
            </aside>

            <main className="map-area">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <ChangeView center={mapCenter} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {/* Marcadores do Geocode individual */}
                    {geoResult && <Marker position={[geoResult.lat, geoResult.lng]}><Popup>Teste Geocode</Popup></Marker>}

                    {/* Marcadores da Logística */}
                    {shipments.map(s => (
                        <React.Fragment key={s.id}>
                            <Marker position={[s.pickup.lat, s.pickup.lng]}><Popup>Coleta: {s.name}</Popup></Marker>
                            <Marker position={[s.delivery.lat, s.delivery.lng]}><Popup>Entrega: {s.name}</Popup></Marker>
                        </React.Fragment>
                    ))}

                    {/* Traçado da Rota (Apenas se clicar em Traçar) */}
                    {showRoute && optResult && optResult.route && (
                        <Polyline positions={optResult.route} color="#27ae60" weight={5} />
                    )}
                </MapContainer>
            </main>
        </div>
    );
}

export default App;
