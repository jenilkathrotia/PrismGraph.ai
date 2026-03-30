'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, User, Tag, Wrench, MessageSquare, Database as DataIcon, Building, MapPin, Layers, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  paper: <FileText className="w-3.5 h-3.5" />,
  author: <User className="w-3.5 h-3.5" />,
  topic: <Tag className="w-3.5 h-3.5" />,
  method: <Wrench className="w-3.5 h-3.5" />,
  claim: <MessageSquare className="w-3.5 h-3.5" />,
  dataset: <DataIcon className="w-3.5 h-3.5" />,
  venue: <Building className="w-3.5 h-3.5" />,
  institution: <MapPin className="w-3.5 h-3.5" />,
  cluster: <Layers className="w-3.5 h-3.5" />,
  keyword: <Hash className="w-3.5 h-3.5" />,
};

function GraphNodeComponent({ data }: NodeProps) {
  const { label, type, color, isSelected } = data;
  const truncLabel = label?.length > 24 ? label.slice(0, 22) + '…' : label;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200
          ${isSelected ? 'scale-110 ring-2 ring-white/30' : 'hover:scale-105'}`}
        style={{
          background: `${color}20`,
          border: `1.5px solid ${color}60`,
          boxShadow: isSelected ? `0 0 20px ${color}40, 0 0 40px ${color}15` : `0 0 10px ${color}20`,
          maxWidth: '180px',
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: color, color: '#fff' }}
        >
          {iconMap[type] || <FileText className="w-3.5 h-3.5" />}
        </div>
        <span className="text-xs font-medium text-white truncate">{truncLabel}</span>
      </motion.div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </>
  );
}

export default memo(GraphNodeComponent);
