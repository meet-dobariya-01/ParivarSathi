import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="badge badge-approved" id="badge-approved">
          <CheckCircle2 size={13} /> APPROVED ✓
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="badge badge-under-review" id="badge-under-review">
          <Clock size={13} /> UNDER REVIEW
        </span>
      );
    case 'REJECTED':
      return (
        <span className="badge badge-rejected" id="badge-rejected">
          <XCircle size={13} /> REJECTED
        </span>
      );
    case 'SUBMITTED':
    default:
      return (
        <span className="badge badge-submitted" id="badge-submitted">
          <Clock size={13} /> SUBMITTED
        </span>
      );
  }
};

export default StatusBadge;
