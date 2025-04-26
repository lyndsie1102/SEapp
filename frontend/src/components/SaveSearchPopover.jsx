import React, { useState, useRef, useEffect } from 'react';

const SaveSearchPopover = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage('Please enter a name for your search');
      return;
    }
  
    setIsSaving(true);
    setMessage('');
  
    try {
      await onSave(name);
      setMessage('Search saved successfully!');
      setTimeout(() => {
        onClose();
        setName('');
        setMessage('');
      }, 800);
    } catch (errorResponse) {
      if (errorResponse?.data?.error) {
        setMessage(errorResponse.data.error);  // ✅ Show "Name already exists..."
      } else {
        setMessage('Failed to save search. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className="popover-content">
      <h3>Save Your Search</h3>
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 'name'"
          autoFocus
        />
      </div>
      {message && (
        <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
      <div className="popover-actions">
        <button onClick={onClose} disabled={isSaving}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default SaveSearchPopover;