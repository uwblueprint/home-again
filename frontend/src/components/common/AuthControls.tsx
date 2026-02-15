import React from "react";

export const Logout: React.FC = () => (
  <button type="button" className="btn btn-secondary">
    Logout
  </button>
);

export const RefreshCredentials: React.FC = () => (
  <button type="button" className="btn btn-secondary">
    Refresh Credentials
  </button>
);

export const ResetPassword: React.FC = () => (
  <button type="button" className="btn btn-secondary">
    Reset Password
  </button>
);

export default { Logout, RefreshCredentials, ResetPassword };
