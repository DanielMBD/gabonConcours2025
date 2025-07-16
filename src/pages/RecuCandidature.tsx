
import React from 'react';
import RecuCandidaturePDF from '@/components/RecuCandidaturePDF';

const RecuCandidature = ({ candidatureData, onDownload }) => {
  return (
    <RecuCandidaturePDF 
      candidatureData={candidatureData}
      onDownload={onDownload}
    />
  );
};

export default RecuCandidature;
