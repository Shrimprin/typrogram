'use client';

import type { FileItem } from '@/types';

import { AlertTriangle, Check, ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';

import { sortFileItems } from '@/utils/sort';

type FileTreeItemProps = {
  fileItem: FileItem;
  level: number;
  selectedFileItem?: FileItem;
  onSelectFileItem: (file: FileItem) => void;
};

export default function FileTreeItem({ fileItem, level, selectedFileItem, onSelectFileItem }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (fileItem.type === 'dir') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleFileSelect = () => {
    if (fileItem.type === 'file') {
      onSelectFileItem(fileItem);
    }
  };

  const isSelected = selectedFileItem?.id === fileItem.id;
  const isTyped = fileItem.status === 'typed';
  const isTyping = fileItem.status === 'typing';
  const isUnsupported = fileItem.status === 'unsupported';
  const fileItems: FileItem[] = fileItem.fileItems || [];
  const sortedFileItems = sortFileItems(fileItems);
  const isDir = fileItem.type === 'dir';

  const getFileNameClass = () => {
    if (isSelected) return 'text-primary font-bold';
    if (isTyped) return 'text-secondary';
    if (isUnsupported) return 'text-muted-foreground';
    return '';
  };

  return (
    <div style={{ marginLeft: `${level * 4}px` }}>
      <button
        className={`
          flex w-full cursor-pointer items-center py-1
          hover:bg-accent
        `}
        onClick={isDir ? toggleExpand : handleFileSelect}
      >
        {isDir ? (
          <>
            <span className="mr-1 flex-shrink-0">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <div
              className={`
                flex items-center
                ${getFileNameClass()}
              `}
            >
              <Folder size={16} className="mr-1 flex-shrink-0" />
              <span className="truncate">{fileItem.name}</span>
            </div>
            {isTyped && <Check size={16} className="mr-2 ml-auto flex-shrink-0 text-secondary" />}
          </>
        ) : (
          <>
            <div className="mr-1 w-4 flex-shrink-0"></div>
            <div
              className={`
                flex items-center
                ${getFileNameClass()}
              `}
            >
              <File size={16} className="mr-1 flex-shrink-0" />
              <span className="truncate">{fileItem.name}</span>
            </div>
            {isTyped ? (
              <Check size={16} className="mr-2 ml-auto flex-shrink-0 text-secondary" />
            ) : isTyping ? (
              <div className="mr-2 ml-auto flex h-4 w-4 flex-shrink-0 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-muted-foreground shadow-lg" />
              </div>
            ) : isUnsupported ? (
              <AlertTriangle size={16} className="mr-2 ml-auto flex-shrink-0 text-muted-foreground" />
            ) : null}
          </>
        )}
      </button>

      {isExpanded && sortedFileItems.length > 0 && (
        <div>
          {sortedFileItems.map((child) => (
            <FileTreeItem
              key={child.id}
              fileItem={child}
              level={level + 1}
              selectedFileItem={selectedFileItem}
              onSelectFileItem={onSelectFileItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
