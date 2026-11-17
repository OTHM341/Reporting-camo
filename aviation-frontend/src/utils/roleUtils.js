/**
 * Role-based access control utilities
 * Provides helper functions for data filtering and permission checks
 */

/**
 * Check if user has specific role
 */
export const hasRole = (user, role) => {
    return user?.roles?.includes(role) || false;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user, roles) => {
    return roles.some(role => hasRole(user, role));
};

/**
 * Check if user is a technician
 */
export const isTechnician = (user) => {
    return hasRole(user, 'TECHNICIAN');
};

/**
 * Check if user is a manager
 */
export const isManager = (user) => {
    return hasRole(user, 'MANAGER');
};

/**
 * Check if user is an admin
 */
export const isAdmin = (user) => {
    return hasRole(user, 'ADMIN');
};

/**
 * Filter defects by reported by user (for technicians)
 */
export const filterDefectsByUser = (defects, user) => {
    if (!user || !isTechnician(user)) return defects;
    const technicianName = `${user.firstName} ${user.lastName}`;
    return defects.filter(d => 
        d.reportedBy === technicianName || 
        d.reportedBy?.id === user.id ||
        d.reportedBy?.username === user.username
    );
};

/**
 * Filter work orders by assigned technician
 */
export const filterWorkOrdersByUser = (workOrders, user) => {
    if (!user || !isTechnician(user)) return workOrders;
    const technicianName = `${user.firstName} ${user.lastName}`;
    return workOrders.filter(wo => 
        wo.assignedTo === technicianName || 
        wo.assignedTo?.id === user.id ||
        wo.assignedTo?.username === user.username
    );
};

/**
 * Filter work packages by assigned technician (via work orders)
 */
export const filterWorkPackagesByUser = (workPackages, user) => {
    if (!user || !isTechnician(user)) return workPackages;
    const technicianName = `${user.firstName} ${user.lastName}`;
    
    return workPackages.filter(wp => {
        if (!wp.workOrders) return false;
        // Check if any work order in the package is assigned to this technician
        return wp.workOrders.some(wo => 
            wo.assignedTo === technicianName || 
            wo.assignedTo?.id === user.id ||
            wo.assignedTo?.username === user.username
        );
    });
};

/**
 * Get technician's full name
 */
export const getTechnicianName = (user) => {
    if (!user) return 'Unknown';
    return `${user.firstName} ${user.lastName}`;
};

/**
 * Check if user can edit defect
 * Technicians can only edit their own defects that are not resolved
 */
export const canEditDefect = (defect, user) => {
    if (!user || !defect) return false;
    
    // Admins and managers can edit any defect
    if (isAdmin(user) || isManager(user)) return true;
    
    // Technicians can only edit their own defects that are not resolved
    if (isTechnician(user)) {
        const technicianName = getTechnicianName(user);
        const isOwnDefect = defect.reportedBy === technicianName || 
                           defect.reportedBy?.id === user.id;
        const isNotResolved = defect.status !== 'RESOLVED' && defect.status !== 'CLOSED';
        return isOwnDefect && isNotResolved;
    }
    
    return false;
};

/**
 * Check if user can delete defect
 * Only admins can delete defects
 */
export const canDeleteDefect = (user) => {
    return isAdmin(user);
};

/**
 * Check if user can edit work order
 * Technicians can only update progress on their assigned work orders
 */
export const canEditWorkOrder = (workOrder, user) => {
    if (!user || !workOrder) return false;
    
    // Admins and managers can edit any work order
    if (isAdmin(user) || isManager(user)) return true;
    
    // Technicians can only update progress on their assigned work orders
    if (isTechnician(user)) {
        const technicianName = getTechnicianName(user);
        return workOrder.assignedTo === technicianName || 
               workOrder.assignedTo?.id === user.id;
    }
    
    return false;
};

/**
 * Check if user can create work order
 * Only admins and managers can create work orders
 */
export const canCreateWorkOrder = (user) => {
    return isAdmin(user) || isManager(user);
};

/**
 * Check if user can delete work order
 * Only admins can delete work orders
 */
export const canDeleteWorkOrder = (user) => {
    return isAdmin(user);
};

/**
 * Check if user can edit work package
 * Only admins and managers can edit work packages
 */
export const canEditWorkPackage = (user) => {
    return isAdmin(user) || isManager(user);
};

/**
 * Check if user can delete work package
 * Only admins can delete work packages
 */
export const canDeleteWorkPackage = (user) => {
    return isAdmin(user);
};
