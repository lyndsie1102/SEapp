import React from "react";

const AdvancedFilter = ({ filters, values, onChange }) => {
  return (
    <div className="advanced-filter">
      {filters.map((filter) => (
        <div key={filter.name} style={{ marginBottom: "1rem" }}>
          <label>{filter.label}: </label>
          {filter.type === "select" ? (
            <select
              value={values[filter.name] || ""}
              onChange={(e) => onChange(filter.name, e.target.value)}
            >
              <option value="">Any</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={values[filter.name] || ""}
              placeholder={filter.placeholder || ""}
              onChange={(e) => onChange(filter.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default AdvancedFilter;
