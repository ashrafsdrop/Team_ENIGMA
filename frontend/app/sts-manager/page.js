"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function STSManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stsList, setStsList] = useState([]);
  const [selectedSts, setSelectedSts] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const headers = {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch STS data
        const stsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sts/`, { headers });
        if (!stsRes.ok) throw new Error("Failed to fetch STS data");
        const stsData = await stsRes.json();
        setStsList(stsData);
        
        // Auto-select first STS if available
        if (stsData.length > 0) {
          setSelectedSts(stsData[0]);
        }

        // Fetch pending waste requests
        const requestsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waste-requests/?status=pending`, { headers });
        if (requestsRes.ok) {
          const reqData = await requestsRes.json();
          setPendingRequests(reqData.filter(r => r.status === 'pending'));
        }

        // Fetch transfers
        const transfersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waste-transfers/`, { headers });
        if (transfersRes.ok) {
          const transData = await transfersRes.json();
          setTransfers(transData);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleAssignVan = async (requestId, vanId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waste-requests/${requestId}/assign_van/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ van_id: vanId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign van");
      
      alert("Van successfully assigned!");
      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      // Reload STS to get updated van statuses
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleRequestTruck = async () => {
    if (!selectedSts) return;
    const tonnes = prompt("How many tonnes do you need transferred to the landfill?");
    if (!tonnes) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waste-transfers/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sts: selectedSts.id,
          requested_tonnes: parseFloat(tonnes),
          status: 'requested'
        })
      });
      
      if (!res.ok) throw new Error("Failed to request truck");
      alert("Truck requested successfully!");
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDispatchTruck = async (transferId) => {
    const weight = prompt("Enter the exact weight leaving the STS (in tonnes):");
    if (!weight) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waste-transfers/${transferId}/dispatch_truck/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weight_leaving_sts: parseFloat(weight)
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch");
      alert("Truck dispatched!");
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              STS Manager Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage transfer stations, dispatch vans, and coordinate heavy trucks.</p>
          </div>
          
          {stsList.length > 0 && (
            <select 
              className="bg-[#24283b] text-white border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
              value={selectedSts?.id || ''}
              onChange={(e) => setSelectedSts(stsList.find(s => s.id == e.target.value))}
            >
              {stsList.map(sts => (
                <option key={sts.id} value={sts.id}>{sts.name}</option>
              ))}
            </select>
          )}
        </div>

        {selectedSts ? (
          <>
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1 relative z-10">Total Capacity</h3>
                <div className="text-4xl font-bold text-white relative z-10">{selectedSts.capacity_tonnes} <span className="text-lg text-gray-500">t</span></div>
              </div>
              
              <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/5 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1 relative z-10">Current Fill</h3>
                <div className="text-4xl font-bold text-indigo-400 relative z-10">{selectedSts.current_fill_tonnes} <span className="text-lg text-gray-500">t</span></div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 h-2 mt-4 rounded-full overflow-hidden relative z-10">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((selectedSts.current_fill_tonnes / selectedSts.capacity_tonnes) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col justify-center items-center">
                <button 
                  onClick={handleRequestTruck}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-1"
                >
                  Request Heavy Truck
                </button>
                <p className="text-xs text-gray-400 mt-3 text-center">Alert Landfill Manager to dispatch a heavy truck for transfer.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vans List */}
              <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                  Local Van Fleet
                </h2>
                <div className="space-y-4">
                  {selectedSts.vans?.length === 0 ? (
                    <p className="text-gray-500 italic">No vans assigned to this STS.</p>
                  ) : (
                    selectedSts.vans?.map(van => (
                      <div key={van.id} className="bg-[#24283b] p-4 rounded-xl border border-gray-700 flex justify-between items-center hover:border-gray-500 transition-colors">
                        <div>
                          <div className="font-bold text-lg">{van.registration_number}</div>
                          <div className="text-sm text-gray-400">Driver: {van.driver_name || 'Unassigned'}</div>
                          <div className="mt-2 text-xs font-mono bg-gray-800 px-2 py-1 rounded inline-block text-blue-400">
                            Load: {van.current_load_kg} / {van.capacity_kg} kg
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            van.status === 'idle' ? 'bg-gray-700 text-gray-300' : 
                            van.status === 'collecting' ? 'bg-green-500/20 text-green-400' : 
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {van.status.toUpperCase()}
                          </span>
                          <div className="mt-2 text-xs text-gray-500">Trips: {van.trips_today}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Waste Requests */}
              <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <span className="w-2 h-6 bg-orange-500 rounded-full mr-3"></span>
                  Pending Collections (Area)
                </h2>
                <div className="space-y-4">
                  {pendingRequests.length === 0 ? (
                    <p className="text-gray-500 italic">No pending requests in this area.</p>
                  ) : (
                    pendingRequests.map(req => (
                      <div key={req.id} className="bg-[#24283b] p-4 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold text-white">{req.waste_type_details?.name || 'Waste'} - {req.weight}kg</div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">{req.description}</div>
                          </div>
                          <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-md">Pending</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <select 
                            id={`van-select-${req.id}`}
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg text-sm px-3 outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>Select Van to Assign...</option>
                            {selectedSts.vans?.filter(v => v.status !== 'returning').map(van => (
                              <option key={van.id} value={van.id}>{van.registration_number} (Avail: {van.capacity_kg - van.current_load_kg}kg)</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              const sel = document.getElementById(`van-select-${req.id}`);
                              if (sel.value) handleAssignVan(req.id, sel.value);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Outbound Transfers (STS to Landfill) */}
            <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                Active Truck Transfers
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Truck</th>
                      <th className="pb-3 font-medium">Req. Tonnes</th>
                      <th className="pb-3 font-medium">Leaving STS</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.filter(t => t.sts === selectedSts.id).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-gray-500 italic">No active transfers.</td>
                      </tr>
                    ) : (
                      transfers.filter(t => t.sts === selectedSts.id).map(transfer => (
                        <tr key={transfer.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 text-gray-300">#{transfer.id}</td>
                          <td className="py-4 text-white font-mono">{transfer.truck || 'Pending...'}</td>
                          <td className="py-4 text-gray-300">{transfer.requested_tonnes}t</td>
                          <td className="py-4 text-gray-300">{transfer.weight_leaving_sts ? `${transfer.weight_leaving_sts}t` : '-'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              transfer.status === 'requested' ? 'bg-gray-700 text-gray-300' :
                              transfer.status === 'truck_assigned' ? 'bg-blue-500/20 text-blue-400' :
                              transfer.status === 'in_transit' ? 'bg-amber-500/20 text-amber-400' :
                              transfer.status === 'received' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {transfer.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {transfer.status === 'truck_assigned' && (
                              <button 
                                onClick={() => handleDispatchTruck(transfer.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-1.5 rounded font-medium transition-colors shadow-lg shadow-indigo-500/20"
                              >
                                Dispatch
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        ) : (
          <div className="text-center text-gray-500 py-12">No STS selected or assigned to you.</div>
        )}
      </div>
    </div>
  );
}
