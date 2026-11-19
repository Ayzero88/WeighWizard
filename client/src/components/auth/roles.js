// One place that says who may do what.
// The screens read from here today; the backend checks will use the same table later.
export const RULES = {
  viewTickets: ["superadmin", "admin", "operator"],
  editTicket: ["superadmin", "admin"],
  deleteTicket: ["superadmin"],
  exportTickets: ["superadmin", "admin"],
  exportDeleted: ["superadmin"],
  backup: ["superadmin", "admin"],
  manageUsers: ["superadmin", "admin"],
};

// true when the logged-in user's role is in the allowed list
export const hasRole = (user, allowedRoles) => allowedRoles.includes(user?.role);
