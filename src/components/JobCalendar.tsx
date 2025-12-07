'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Users } from 'lucide-react';
import JobDetailModal from './JobDetailModal';
import CreateJobModal from './CreateJobModal';
import InviteModal from './InviteModal';

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
  hasPendingDurationRequest?: boolean;
}

const DEMO_ASSIGNEE_EMAIL = 'john@example.com';
const DEMO_CREATOR_EMAIL = 'admin@example.com';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
    case 'in-progress':
      return 'bg-amber-50 text-amber-900 border-amber-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-slate-50 text-slate-900 border-slate-300';
  }
};

export default function JobCalendar({ currentUserEmail, currentUserName, currentUserRole, onLogout }: { currentUserEmail?: string; currentUserName?: string; currentUserRole?: string; onLogout?: () => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Array<{id: string, name: string, email: string, role: string}>>([]);
  const [selectedCraftsman, setSelectedCraftsman] = useState<string>('all');
  
  // Use provided email or fallback to demo email
  const userEmail = currentUserEmail || 'john@example.com';
  const userRole = currentUserRole || 'user';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchJobs();
    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  // Refetch jobs when craftsman selection changes
  useEffect(() => {
    fetchJobs();
  }, [selectedCraftsman]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show non-admin users (craftsmen/workers)
        const workers = data.filter((u: any) => u.role !== 'admin');
        setUsers(workers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        // Ensure all jobs have required fields
        let normalizedJobs = data.map((job: any) => ({
          id: job.id,
          title: job.title || 'Untitled Job',
          description: job.description || '',
          status: job.status || 'pending',
          scheduledDate: job.scheduledDate,
          duration: job.duration || 1,
          assignedTo: job.assignedTo || { name: 'Unassigned', email: 'unknown@example.com' },
          lineItems: Array.isArray(job.lineItems) ? job.lineItems : [],
          notes: Array.isArray(job.notes) ? job.notes : [],
          photos: Array.isArray(job.photos) ? job.photos : [],
          serviceAlerts: Array.isArray(job.serviceAlerts) ? job.serviceAlerts : [],
        }));
        
        // Filter jobs based on user role and selected craftsman
        if (!isAdmin) {
          // Workers only see their own jobs
          normalizedJobs = normalizedJobs.filter((job: Job) => job.assignedTo?.email === userEmail);
        } else if (selectedCraftsman !== 'all') {
          // Admin viewing specific craftsman's jobs
          normalizedJobs = normalizedJobs.filter((job: Job) => job.assignedTo?.email === selectedCraftsman);
        }
        // If admin and 'all' selected, show all jobs
        
        setJobs(normalizedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLocalDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter((job) => {
      const jobStart = new Date(job.scheduledDate);
      jobStart.setHours(0, 0, 0, 0);
      const jobEnd = new Date(jobStart);
      jobEnd.setDate(jobEnd.getDate() + job.duration - 1);
      
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate >= jobStart && checkDate <= jobEnd;
    });
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(selectedDate);
    const firstDay = firstDayOfMonth(selectedDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-2 min-h-24"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dayJobs = getJobsForDate(currentDate);
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(currentDate)}
          className={`min-h-24 p-2 border cursor-pointer transition-colors ${
            isToday
              ? 'bg-emerald-50 border-emerald-400'
              : isSelected
              ? 'bg-slate-100 border-slate-400'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className={`text-sm font-semibold ${isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayJobs.slice(0, 3).map((job) => {
              const isCompleted = job.status === 'completed';
              const hasDurationRequest = job.hasPendingDurationRequest;
              const hasAlerts = job.serviceAlerts && job.serviceAlerts.length > 0;
              
              let bgColor = 'bg-slate-200';
              let textColor = 'text-slate-900';
              let borderColor = 'border-slate-300';
              let hoverColor = 'hover:bg-slate-300';
              
              if (isCompleted) {
                bgColor = 'bg-green-500';
                textColor = 'text-white';
                borderColor = 'border-green-600';
                hoverColor = 'hover:bg-green-600';
              } else if (hasDurationRequest) {
                bgColor = 'bg-red-500';
                textColor = 'text-white';
                borderColor = 'border-red-600';
                hoverColor = 'hover:bg-red-600';
              }
              
              return (
                <div
                  key={job.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                  className={`text-xs ${bgColor} ${textColor} p-1 cursor-pointer ${hoverColor} truncate border ${borderColor} flex items-center gap-1`}
                >
                  <span className="flex-1 truncate">{job.title}</span>
                  {job.duration > 1 && <span className="text-[10px] opacity-70">({job.duration}d)</span>}
                  {isCompleted && hasAlerts && (
                    <span className="text-yellow-300" title="Completed with alerts">⚠</span>
                  )}
                </div>
              );
            })}
            {dayJobs.length > 3 && (
              <div className="text-xs text-gray-600">+{dayJobs.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateJobs = getJobsForDate(selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">MyWork</h1>
            {currentUserName && <p className="text-sm text-slate-300 mt-1">Logged in as {currentUserName}</p>}
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 transition rounded font-semibold"
                >
                  <Plus size={20} />
                  New Job
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 transition rounded font-semibold"
                >
                  <Users size={20} />
                  Invite Team
                </button>
              </>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 transition rounded font-semibold"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Craftsman Selector for Admin */}
      {isAdmin && users.length > 0 && (
        <div className="bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-300">View Calendar For:</label>
            <select
              value={selectedCraftsman}
              onChange={(e) => setSelectedCraftsman(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Craftsmen</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-400">
              {selectedCraftsman === 'all' 
                ? `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''} for all craftsmen`
                : `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''} for ${users.find(u => u.email === selectedCraftsman)?.name || 'selected craftsman'}`
              }
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 shadow">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6 p-6 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
              >
                ←
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
              >
                →
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0 mb-2 px-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-gray-700 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border border-gray-200 mx-6 mb-6">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white border border-gray-200 shadow p-6 rounded-lg h-fit sticky top-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 pb-4 border-b-2 border-emerald-200">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDateJobs.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No jobs scheduled for this date</p>
            ) : (
              selectedDateJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 border-2 rounded-lg cursor-pointer hover:shadow-lg transition ${getStatusColor(job.status)}`}
                >
                  <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-700 mt-2">{job.assignedTo.name}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                    <Clock size={16} />
                    <span className="font-semibold">{job.duration} day{job.duration > 1 ? 's' : ''}</span>
                  </div>
                  {job.status !== 'pending' && (
                    <span className="inline-block mt-3 px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-full">
                      {job.status.toUpperCase()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full mt-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center gap-2 font-semibold transition"
            >
              <Plus size={18} />
              New Job
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          currentUserEmail={userEmail}
          currentUserRole={userRole}
          onClose={() => setSelectedJob(null)}
          onJobUpdated={() => {
            setSelectedJob(null);
            fetchJobs();
          }}
        />
      )}

      {showCreateModal && (
        <CreateJobModal
          assignedToEmail={userEmail}
          createdByEmail={userEmail}
          selectedDate={formatLocalDate(selectedDate)}
          onClose={() => setShowCreateModal(false)}
          onJobCreated={() => {
            setShowCreateModal(false);
            fetchJobs();
          }}
        />
      )}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        currentUserEmail={userEmail}
      />
    </div>
  );
}

