import React, { useState } from 'react';
import axios from 'axios';

const SaveSearch = ({ query, filters, mediaType, disabled }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to save searches');
            setIsSaving(false);
            return;
        }

        try {
            const response = await axios.post('/recent_search', {
                query: query.trim(),
                media_type: mediaType,
                filters: filters && Object.keys(filters).length > 0 ? filters : undefined
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                validateStatus: (status) => status < 500
            });

            if (response.status === 200 && response.data.message === "Search already exists") {
                setError('Search already saved');
                console.log('Saving search:', {
                    query: query.trim(),
                    media_type: mediaType,
                    filters: filters
                });
            } else if (response.status >= 400) {
                throw new Error(response.data.error || 'Failed to save');
            } else {
                setError('Search saved successfully!');
            }
        } catch (err) {
            console.error('Save failed:', {
                error: err,
                response: err.response?.data
            });
            setError(err.response?.data?.error || err.message || 'Failed to save search');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="save-search-container">
            <button
                onClick={handleSave}
                disabled={disabled || isSaving || !query.trim()}
                className="save-search-button"
            >
                {isSaving ? 'Saving...' : 'Save Search'}
            </button>
            {error && <div className="save-search-error">{error}</div>}
        </div>
    );
};

export default SaveSearch;