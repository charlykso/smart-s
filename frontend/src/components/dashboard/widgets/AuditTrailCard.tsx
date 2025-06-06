import React from 'react';

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AuditTrailCardProps {
  title: string;
  entries: AuditEntry[];
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

const AuditTrailCard: React.FC<AuditTrailCardProps> = ({
  title,
  entries,
  maxItems = 5,
  onViewAll,
  className = '',
}) => {
  const displayedEntries = entries.slice(0, maxItems);

  const getSeverityColor = (severity: AuditEntry['severity']) => {
    const colorMap = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100',
    };
    return colorMap[severity];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            {title}
          </h3>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          )}
        </div>

        {displayedEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary-400 text-4xl mb-2">📋</div>
            <p className="text-secondary-500 text-sm">No audit entries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border border-secondary-200 ${
                  index !== displayedEntries.length - 1 ? 'mb-3' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-secondary-900">
                        {entry.action}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                        {entry.severity}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 mb-2">
                      {entry.details}
                    </p>
                    <div className="flex items-center justify-between text-xs text-secondary-500">
                      <span>by {entry.user}</span>
                      <span>{entry.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrailCard;
