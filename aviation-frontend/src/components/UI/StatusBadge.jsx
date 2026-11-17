const StatusBadge = ({ status, type = 'default' }) => {
    const styles = {
        default: {
            ACTIVE: 'status-active',
            SCHEDULED: 'status-scheduled',
            PLANNED: 'status-planned',
            OPEN: 'status-open',
            COMPLETED: 'status-completed',
            DELAYED: 'status-delayed',
            IN_PROGRESS: 'status-in-progress',
            ASSIGNED: 'status-assigned',
            CRITICAL: 'status-critical',
            CANCELLED: 'status-cancelled',
            MAINTENANCE: 'status-maintenance',
            CLOSED: 'status-closed',
            RESOLVED: 'status-resolved',
        }
    };

    const className = styles[type]?.[status] || 'bg-slate-100 text-slate-600 border border-slate-200';

    return (
        <span className={`status-badge ${className}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
};

export default StatusBadge;
