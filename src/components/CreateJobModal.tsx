'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Unit = 'LF' | 'SF' | 'EA';

interface LineItem {
  title: string;
  unit: Unit;
  quantity: number;
  note: string;
}

const LINE_ITEM_PRESETS: { label: string; unit: Unit }[] = [
  { label: 'Power wash / clean', unit: 'SF' },
  { label: 'Scrape & prep surfaces', unit: 'SF' },
  { label: 'Prime surfaces', unit: 'SF' },
  { label: 'Paint walls (2 coats)', unit: 'SF' },
  { label: 'Paint trim/doors', unit: 'LF' },
  { label: 'Caulk / seal gaps', unit: 'LF' },
  { label: 'Stain / seal wood', unit: 'SF' },
  { label: 'Cleanup & haul away', unit: 'EA' },
];

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
    { title: '', unit: 'EA', quantity: 1, note: '' },
  ]);
  const [loading, setLoading] = useState(false);

  // Keep scheduled date in sync with calendar selection to avoid off-by-one
  useEffect(() => {
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  }, [selectedDate]);

  const addLineItem = () => {
    setLineItems([...lineItems, { title: '', unit: 'EA', quantity: 1, note: '' }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleCreateJob = async () => {
    if (!title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('At least one line item is required');
      return;
    }
    if (lineItems.some((li) => !li.title.trim())) {
      toast.error('Each line item needs a label');
      return;
    }

    setLoading(true);
    try {
      const formattedLineItems = lineItems.map((item) => {
        const descriptionParts: string[] = [];
        if (item.unit) descriptionParts.push(`[${item.unit}]`);
        if (item.note?.trim()) descriptionParts.push(item.note.trim());

        return {
          title: item.title || 'Line item',
          description: descriptionParts.join(' '),
          quantity: item.quantity || 1,
          rate: 0,
        };
      });

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
          lineItems: formattedLineItems,
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
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl my-6">
        <div className="sticky top-0 bg-slate-900 text-white p-5 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold leading-tight">Create New Job</h2>
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 p-2 rounded transition text-xl">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-2">Job Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Roof Installation" 
              className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-slate-900 mb-2">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Job details and notes..." 
              className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm h-24 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="border-t-2 border-slate-200 pt-5">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Customer Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="e.g., John Smith" 
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Customer Address</label>
                <input 
                  type="text" 
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  placeholder="e.g., 123 Main St, City, State ZIP" 
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Customer Phone</label>
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="e.g., (555) 123-4567" 
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Scheduled Date</label>
              <input 
                type="date" 
                value={scheduledDate} 
                onChange={(e) => setScheduledDate(e.target.value)} 
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Duration (days)</label>
              <input 
                type="number" 
                min="1" 
                value={duration} 
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Assign To</label>
            <select 
              value={assignedToEmailState} 
              onChange={(e) => setAssignedToEmailState(e.target.value)} 
              className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
            >
              <option value="john@example.com">John Doe (john@example.com)</option>
              <option value="admin@example.com">Admin (admin@example.com)</option>
            </select>
          </div>

          <div className="border-t-2 border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">Line Items ({lineItems.length})</h3>
              <p className="text-xs text-slate-500">No pricing shown (quantity + unit only)</p>
            </div>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Preset</p>
                      <select
                        value={LINE_ITEM_PRESETS.find(p => p.label === item.title)?.label || ''}
                        onChange={(e) => {
                          const preset = LINE_ITEM_PRESETS.find(p => p.label === e.target.value);
                          if (preset) {
                            updateLineItem(index, 'title', preset.label);
                            updateLineItem(index, 'unit', preset.unit);
                          } else {
                            updateLineItem(index, 'title', '');
                          }
                        }}
                        className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm"
                      >
                        <option value="">Custom / Other</option>
                        {LINE_ITEM_PRESETS.map((preset) => (
                          <option key={preset.label} value={preset.label}>
                            {preset.label} ({preset.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Label</p>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                        placeholder="e.g., Paint walls"
                        className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Quantity</p>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Unit</p>
                      <select
                        value={item.unit}
                        onChange={(e) => updateLineItem(index, 'unit', e.target.value as Unit)}
                        className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm"
                      >
                        <option value="LF">LF</option>
                        <option value="SF">SF</option>
                        <option value="EA">EA</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Note (optional)</p>
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => updateLineItem(index, 'note', e.target.value)}
                        placeholder="e.g., 2 coats"
                        className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">Preview: {item.quantity} {item.unit} — {item.title || 'Line item'} {item.note ? `(${item.note})` : ''}</div>

                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(index)}
                      className="w-full px-3 py-2.5 bg-red-700 text-white hover:bg-red-800 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addLineItem}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-700 hover:border-emerald-700 hover:text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Plus size={18} />
                Add Line Item
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-100 border-t-2 border-slate-200 p-5 flex gap-3 justify-end rounded-b-lg">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-200 font-bold text-sm transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateJob} 
            disabled={loading} 
            className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-bold text-sm disabled:bg-gray-400 transition"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
