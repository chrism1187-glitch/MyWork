'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  scheduledDate: string;
  duration: number;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  assignedTo: { name: string; email: string };
  lineItems: any[];
  notes: any[];
  photos: any[];
  serviceAlerts: any[];
}

interface LineItem {
  id?: string;
  title: string;
  description?: string;
  quantity: number;
  rate?: number;
  status?: string;
}

interface Props {
  job: Job;
  onClose: () => void;
  onJobUpdated: () => void;
  currentUserEmail: string;
  currentUserRole?: string;
}

export default function JobDetailModal({ job, onClose, onJobUpdated, currentUserEmail, currentUserRole }: Props) {
  const [status, setStatus] = useState(job.status);
  const [duration, setDuration] = useState(job.duration);
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description || '');
  const [lineItems, setLineItems] = useState<LineItem[]>(job.lineItems || []);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(job.scheduledDate);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [customerName, setCustomerName] = useState(job.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(job.customerAddress || '');
  const [customerPhone, setCustomerPhone] = useState(job.customerPhone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(job.notes || []);
  const [photos, setPhotos] = useState(job.photos || []);
  const [alerts, setAlerts] = useState(job.serviceAlerts || []);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertDescription, setAlertDescription] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'urgent' | 'non-urgent'>('non-urgent');
  
  const userRole = currentUserRole || 'user';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchNotes();
    fetchPhotos();
    fetchAlerts();
  }, []);

  // Keep form state in sync when opening a different job
  useEffect(() => {
    setStatus(job.status);
    setDuration(job.duration);
    setTitle(job.title);
    setDescription(job.description || '');
    setLineItems(job.lineItems || []);
    const d = new Date(job.scheduledDate);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setScheduledDate(`${yyyy}-${mm}-${dd}`);
    setCustomerName(job.customerName || '');
    setCustomerAddress(job.customerAddress || '');
    setCustomerPhone(job.customerPhone || '');
    setIsEditing(false);
  }, [job.id]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(Array.isArray(data) ? data : []);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : []);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setStatus(newStatus);
        toast.success('Status updated');
        onJobUpdated(); // Refresh calendar
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async () => {
    if (!title.trim()) {
      toast.error('Job title cannot be empty');
      return;
    }
    if (!scheduledDate) {
      toast.error('Scheduled date is required');
      return;
    }
    if (isAdmin && lineItems.some((li) => !li.title?.trim())) {
      toast.error('Each line item needs a title');
      return;
    }
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          scheduledDate,
          duration,
          customerName,
          customerAddress,
          customerPhone,
          lineItems: isAdmin ? lineItems.map((li) => ({
            id: li.id,
            title: li.title || 'Line item',
            description: li.description || '',
            quantity: Math.max(1, Number(li.quantity) || 1),
            rate: typeof li.rate === 'number' ? li.rate : 0,
            status: li.status || 'pending',
          })) : undefined,
        }),
      });
      if (response.ok) {
        toast.success('Job updated');
        setIsEditing(false);
        onJobUpdated();
      }
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const handleDeleteJob = async () => {
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Job deleted');
        onJobUpdated();
        onClose();
      } else {
        toast.error('Failed to delete job');
      }
    } catch (error) {
      toast.error('Error deleting job');
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { title: '', description: '', quantity: 1, rate: 0, status: 'pending' }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleDurationChange = async (newDuration: number) => {
    if (newDuration < 1) return;
    if (!isAdmin) {
      toast.error('Only admins can change job duration');
      return;
    }
    
    const oldDuration = duration;
    const change = newDuration - oldDuration;
    const changeText = change > 0 ? `+${change} day${Math.abs(change) > 1 ? 's' : ''}` : `${change} day${Math.abs(change) > 1 ? 's' : ''}`;
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: newDuration }),
      });
      if (response.ok) {
        setDuration(newDuration);
        toast.success(`Duration updated: ${changeText} (${oldDuration} → ${newDuration} days)`);
      }
    } catch (error) {
      toast.error('Failed to update duration');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    setLoadingNotes(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUserEmail, content: newNote, isPrivate: false }),
      });
      if (response.ok) {
        const newNoteData = await response.json();
        setNotes([newNoteData, ...notes]);
        setNewNote('');
        toast.success('Note added');
      } else {
        const errorData = await response.json();
        console.error('Note API error:', errorData);
        toast.error(errorData.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Error adding note');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEmail', currentUserEmail);
    try {
      const response = await fetch(`/api/jobs/${job.id}/photos`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const newPhoto = await response.json();
        setPhotos([newPhoto, ...photos]);
        toast.success('Photo uploaded');
      } else {
        const errorData = await response.json();
        console.error('Photo upload error:', errorData);
        toast.error(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error uploading photo');
    }
  };

  const handleServiceAlert = async () => {
    if (!alertDescription.trim()) {
      toast.error('Please describe the service issue');
      return;
    }
    
    try {
      const response = await fetch(`/api/jobs/${job.id}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Service Issue Report',
          description: alertDescription,
          severity: alertSeverity,
        }),
      });
      if (response.ok) {
        const newAlert = await response.json();
        setAlerts([newAlert, ...alerts]);
        setShowAlertModal(false);
        setAlertDescription('');
        setAlertSeverity('non-urgent');
        toast.success('Service alert created');
        onJobUpdated();
      } else {
        toast.error('Failed to create alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send alert');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl my-6">
        <div className="sticky top-0 bg-slate-900 text-white p-5 flex justify-between items-center rounded-t-lg">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold bg-slate-800 border border-slate-600 rounded px-3.5 py-2 text-white flex-1 mr-3"
            />
          ) : (
            <h2 className="text-2xl font-bold leading-tight">{title}</h2>
          )}
          <div className="flex gap-2">
            {isAdmin && isEditing && (
              <>
                <button 
                  onClick={handleSaveEdit} 
                  className="bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded transition font-bold text-sm"
                >
                  Save
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(job.title);
                    setDescription(job.description || '');
                  }} 
                  className="bg-slate-700 hover:bg-slate-600 px-3.5 py-2 rounded transition font-bold text-sm"
                >
                  Cancel
                </button>
              </>
            )}
            {isAdmin && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-slate-700 hover:bg-slate-600 px-3.5 py-2 rounded transition font-bold text-sm"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 p-2 rounded transition text-xl">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Customer Information - Prominent Display */}
          {(customerName || customerAddress || customerPhone || isEditing) && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <h3 className="text-xl font-bold text-blue-900">Customer Information</h3>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Customer Name</p>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Address</p>
                    <input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Address"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Phone</p>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Phone"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {customerName && (
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">Customer Name</p>
                      <p className="text-xl font-bold text-blue-900">{customerName}</p>
                    </div>
                  )}
                  
                  {customerAddress && (
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Address</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border-2 border-blue-400 rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <p className="text-base font-semibold text-blue-900 underline leading-snug">{customerAddress}</p>
                        <p className="text-xs text-blue-700 mt-2 font-semibold">📍 Open in Google Maps</p>
                      </a>
                    </div>
                  )}
                  
                  {customerPhone && (
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Phone Number</p>
                      <a
                        href={`tel:${customerPhone}`}
                        className="block bg-white border-2 border-blue-400 rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition text-center"
                      >
                        <p className="text-xl font-bold text-blue-900">📞 {customerPhone}</p>
                        <p className="text-xs text-blue-600 mt-1 font-semibold">Tap to call</p>
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {isAdmin && isEditing && (
            <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-3">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-emerald-300 rounded-lg text-sm h-24 focus:outline-none focus:border-emerald-600"
                placeholder="Enter job description..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 pb-6 border-b-2 border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Assigned To</p>
              <p className="text-lg font-bold text-slate-900 leading-tight">{job.assignedTo.name}</p>
              <p className="text-xs text-slate-600">{job.assignedTo.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Scheduled Date</p>
              {isEditing ? (
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
                />
              ) : (
                <p className="text-lg font-bold text-slate-900">
                  {new Date(scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Status</p>
              <select 
                value={status} 
                onChange={(e) => handleStatusChange(e.target.value)} 
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-700"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Duration (days)</p>
              {isEditing ? (
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
                />
              ) : (
                <div className="flex gap-3 items-center">
                  {isAdmin && (
                    <button 
                      onClick={() => handleDurationChange(duration - 1)} 
                      className="px-3 py-1.5 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 text-xl"
                    >
                      −
                    </button>
                  )}
                  <span className="text-2xl font-bold text-slate-900 flex-1 text-center">{duration}</span>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDurationChange(duration + 1)} 
                      className="px-3 py-1.5 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 text-xl"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {job.description && (
            <div className="border-t-2 border-slate-200 pt-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">Job Description</h3>
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
              </div>
            </div>
          )}

          <div className="border-t-2 border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Line Items ({lineItems.length})</h3>
              {isAdmin && isEditing && (
                <button
                  onClick={addLineItem}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-sm font-bold rounded hover:bg-emerald-800"
                >
                  Add Line Item
                </button>
              )}
            </div>

            {lineItems.length === 0 ? (
              <p className="text-slate-500 text-sm">No line items</p>
            ) : isAdmin && isEditing ? (
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Title</p>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm"
                          placeholder="e.g., Paint walls"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Quantity</p>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Description / Note</p>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm h-20"
                        placeholder="Optional detail, unit tag, or note"
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(index)}
                        className="w-full py-2 bg-red-700 text-white text-sm font-bold rounded hover:bg-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id || item.title} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                    <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                    <p className="text-sm text-slate-700 mt-1">Qty: {item.quantity}</p>
                    {item.description && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{item.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Notes ({notes.length})</h3>
            <div className="space-y-3">
              <textarea 
                placeholder="Add a note..." 
                value={newNote} 
                onChange={(e) => setNewNote(e.target.value)} 
                className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm h-24 focus:outline-none focus:border-emerald-700"
              />
              <button 
                onClick={handleAddNote} 
                disabled={loadingNotes} 
                className="w-full px-3.5 py-2.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-sm disabled:bg-gray-400 transition"
              >
                {loadingNotes ? 'Adding...' : 'Add Note'}
              </button>
              {notes.length === 0 ? (
                <p className="text-slate-500">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                    <p className="font-bold text-slate-900 text-sm">{note.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{note.content}</p>
                    <p className="text-xs text-slate-500 mt-2">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Photos ({photos.length})</h3>
            <label className="w-full py-3 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 flex items-center justify-center gap-3 mb-3 cursor-pointer transition text-sm">
              <Camera size={20} />
              Add Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photos.length === 0 ? (
              <p className="text-slate-500">No photos yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id}>
                    <img src={photo.url} alt={photo.caption || 'Job photo'} className="w-full h-40 object-cover rounded-lg bg-slate-100" />
                    {photo.caption && <p className="text-sm text-slate-600 mt-2">{photo.caption}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition flex items-center justify-center gap-2 text-sm"
          >
            <AlertTriangle size={18} />
            Report Service Issue
          </button>

          {showAlertModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-3 text-slate-900">Report Service Issue</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                    <select
                      value={alertSeverity}
                      onChange={(e) => setAlertSeverity(e.target.value as 'urgent' | 'non-urgent')}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="non-urgent">Non-Urgent</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                      value={alertDescription}
                      onChange={(e) => setAlertDescription(e.target.value)}
                      placeholder="Describe the service issue..."
                      className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm h-28 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleServiceAlert}
                      className="flex-1 py-2.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition text-sm"
                    >
                      Submit Alert
                    </button>
                    <button
                      onClick={() => {
                        setShowAlertModal(false);
                        setAlertDescription('');
                        setAlertSeverity('non-urgent');
                      }}
                      className="flex-1 py-2.5 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {alerts.length > 0 && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="font-bold text-red-900 mb-2">Active Alerts ({alerts.length})</p>
              {alerts.map((alert) => (
                <p key={alert.id} className="text-red-800">
                  {alert.title} - {alert.severity}
                </p>
              ))}
            </div>
          )}

          {isAdmin && (
            <button
              onClick={handleDeleteJob}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-sm"
            >
              Delete Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
