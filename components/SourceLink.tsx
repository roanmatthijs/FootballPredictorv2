import React from 'react';

interface SourceLinkProps {
  // FIX: Made uri optional to align with the updated GroundingChunk type.
  uri?: string;
  // FIX: Made title optional to align with the updated GroundingChunk type.
  title?: string;
}

export const SourceLink: React.FC<SourceLinkProps> = ({ uri, title }) => {
  if (!uri) {
    return null;
  }

  const hostname = new URL(uri).hostname;

  return (
    <a
      href={uri}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-green-600 hover:text-white transition-colors duration-200"
      title={title || hostname}
    >
      {hostname}
    </a>
  );
};
