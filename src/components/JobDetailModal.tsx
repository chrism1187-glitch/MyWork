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
  assignedTo: { name: string; email: string };
  lineItems: any[];
  notes: any[];
  photos: any[];
  serviceAlerts: any[];
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
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
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
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl my-8">
        <div className="sticky top-0 bg-slate-900 text-white p-6 flex justify-between items-center rounded-t-lg">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold bg-slate-800 border border-slate-600 rounded px-4 py-2 text-white flex-1 mr-4"
            />
          ) : (
            <h2 className="text-3xl font-bold">{title}</h2>
          )}
          <div className="flex gap-2">
            {isAdmin && isEditing && (
              <>
                <button 
                  onClick={handleSaveEdit} 
                  className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded transition font-bold text-sm"
                >
                  Save
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(job.title);
                    setDescription(job.description || '');
                  }} 
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition font-bold text-sm"
                >
                  Cancel
                </button>
              </>
            )}
            {isAdmin && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition font-bold text-sm"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 p-2 rounded transition text-2xl">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-96 overflow-y-auto">
          {isAdmin && isEditing && (
            <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-3">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-emerald-300 rounded-lg text-base h-24 focus:outline-none focus:border-emerald-600"
                placeholder="Enter job description..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 pb-6 border-b-2 border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Assigned To</p>
              <p className="text-xl font-bold text-slate-900">{job.assignedTo.name}</p>
              <p className="text-sm text-slate-600">{job.assignedTo.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Scheduled Date</p>
              <p className="text-xl font-bold text-slate-900">
                {new Date(job.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Status</p>
              <select 
                value={status} 
                onChange={(e) => handleStatusChange(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-lg font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-700"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Duration (days)</p>
              <div className="flex gap-3 items-center">
                {isAdmin && (
                  <button 
                    onClick={() => handleDurationChange(duration - 1)} 
                    className="px-4 py-2 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 text-2xl"
                  >
                    −
                  </button>
                )}
                <span className="text-3xl font-bold text-slate-900 flex-1 text-center">{duration}</span>
                {isAdmin && (
                  <button 
                    onClick={() => handleDurationChange(duration + 1)} 
                    className="px-4 py-2 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 text-2xl"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div>

          {job.description && (
            <div className="border-t-2 border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Description</h3>
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>
          )}

          <div className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Notes ({notes.length})</h3>
            <div className="space-y-3">
              <textarea 
                placeholder="Add a note..." 
                value={newNote} 
                onChange={(e) => setNewNote(e.target.value)} 
                className="w-full p-4 border-2 border-slate-300 rounded-lg text-base h-24 focus:outline-none focus:border-emerald-700"
              />
              <button 
                onClick={handleAddNote} 
                disabled={loadingNotes} 
                className="w-full px-4 py-3 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-base disabled:bg-gray-400 transition"
              >
                {loadingNotes ? 'Adding...' : 'Add Note'}
              </button>
              {notes.length === 0 ? (
                <p className="text-slate-500">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                    <p className="font-bold text-slate-900">{note.user?.name || 'Unknown User'}</p>
                    <p className="text-base text-slate-700 mt-2">{note.content}</p>
                    <p className="text-xs text-slate-500 mt-2">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Photos ({photos.length})</h3>
            <label className="w-full py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 flex items-center justify-center gap-3 mb-4 cursor-pointer transition text-base">
              <Camera size={24} />
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
            className="w-full py-4 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition flex items-center justify-center gap-2 text-lg"
          >
            <AlertTriangle size={24} />
            Report Service Issue
          </button>

          {showAlertModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-slate-900">Report Service Issue</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                    <select
                      value={alertSeverity}
                      onChange={(e) => setAlertSeverity(e.target.value as 'urgent' | 'non-urgent')}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-red-500"
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
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base h-32 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleServiceAlert}
                      className="flex-1 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition"
                    >
                      Submit Alert
                    </button>
                    <button
                      onClick={() => {
                        setShowAlertModal(false);
                        setAlertDescription('');
                        setAlertSeverity('non-urgent');
                      }}
                      className="flex-1 py-3 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400 transition"
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
              className="w-full py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-lg"
            >
              Delete Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
