'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LineItem {
  title: string;
  description: string;
  quantity: number;
  rate: number;
}

interface Props {
  onClose: () => void;
  onJobCreated: () => void;
  assignedToEmail: string;
  createdByEmail: string;
  selectedDate?: string;
}

export default function CreateJobModal({ onClose, onJobCreated, assignedToEmail, createdByEmail, selectedDate }: Props) {
  const getLocalDateString = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(selectedDate || getLocalDateString());
  const [duration, setDuration] = useState(1);
  const [assignedToEmailState, setAssignedToEmailState] = useState(assignedToEmail);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { title: 'Service', description: '', quantity: 1, rate: 100 },
  ]);
  const [loading, setLoading] = useState(false);

  // Keep scheduled date in sync with calendar selection to avoid off-by-one
  useEffect(() => {
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  }, [selectedDate]);

  const addLineItem = () => {
    setLineItems([...lineItems, { title: '', description: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const handleCreateJob = async () => {
    if (!title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          scheduledDate,
          duration,
          assignedToEmail: assignedToEmailState,
          createdByEmail,
          customerName,
          customerAddress,
          customerPhone,
          lineItems,
        }),
      });

      if (response.ok) {
        const job = await response.json();
        toast.success('Job created successfully');
        onJobCreated();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create job');
      }
    } catch (error) {
      toast.error('Error creating job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl my-8">
        <div className="sticky top-0 bg-slate-900 text-white p-6 flex justify-between items-center rounded-t-lg">
          <h2 className="text-3xl font-bold">Create New Job</h2>
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 p-2 rounded transition text-2xl">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-lg font-bold text-slate-900 mb-3">Job Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Roof Installation" 
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-900 mb-3">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Job details and notes..." 
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base h-24 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Customer Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="e.g., John Smith" 
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">Customer Address</label>
                <input 
                  type="text" 
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  placeholder="e.g., 123 Main St, City, State ZIP" 
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">Customer Phone</label>
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="e.g., (555) 123-4567" 
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold text-slate-900 mb-3">Scheduled Date</label>
              <input 
                type="date" 
                value={scheduledDate} 
                onChange={(e) => setScheduledDate(e.target.value)} 
                className="w-full px-4 py-4 h-14 border-2 border-slate-300 rounded-lg text-xl focus:outline-none focus:border-emerald-700"
                style={{ minHeight: '64px' }}
              />
            </div>
            <div>
              <label className="block text-lg font-bold text-slate-900 mb-3">Duration (days)</label>
              <input 
                type="number" 
                min="1" 
                value={duration} 
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-900 mb-3">Assign To</label>
            <select 
              value={assignedToEmailState} 
              onChange={(e) => setAssignedToEmailState(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
            >
              <option value="john@example.com">John Doe (john@example.com)</option>
              <option value="admin@example.com">Admin (admin@example.com)</option>
            </select>
          </div>

          <div className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Line Items ({lineItems.length})</h3>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                      placeholder="Item title"
                      className="px-3 py-3 border-2 border-slate-300 rounded-lg text-base font-semibold"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="px-3 py-3 border-2 border-slate-300 rounded-lg text-base"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-end mb-4">
                    <div>
                      <p className="text-sm font-bold text-slate-600 mb-2">QTY</p>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-3 border-2 border-slate-300 rounded-lg text-base"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-600 mb-2">RATE</p>
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-3 border-2 border-slate-300 rounded-lg text-base"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-600 mb-2">TOTAL</p>
                      <p className="text-2xl font-bold text-emerald-700">\${(item.quantity * item.rate).toFixed(2)}</p>
                    </div>
                  </div>

                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(index)}
                      className="w-full px-3 py-3 bg-red-700 text-white hover:bg-red-800 rounded-lg text-base font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 size={20} />
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addLineItem}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-700 hover:border-emerald-700 hover:text-emerald-700 font-bold text-base flex items-center justify-center gap-2 transition"
              >
                <Plus size={20} />
                Add Line Item
              </button>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
            <div className="flex justify-between items-center text-2xl font-bold text-emerald-900">
              <span>Total Job Value:</span>
              <span>\${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-100 border-t-2 border-slate-200 p-6 flex gap-4 justify-end rounded-b-lg">
          <button 
            onClick={onClose} 
            className="px-6 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-200 font-bold text-base transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateJob} 
            disabled={loading} 
            className="px-8 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-bold text-base disabled:bg-gray-400 transition"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
