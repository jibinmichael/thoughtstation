import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface SessionTitleProps {
  data: {
    title: string;
  };
}

const SessionTitle: React.FC<SessionTitleProps> = ({ data }) => {
  const { title } = data;

  return (
    <div className="session-title">
      <h1 className="session-title-text">
        {title}
      </h1>
      
      {/* Hidden handles for React Flow */}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
};

export default SessionTitle; 