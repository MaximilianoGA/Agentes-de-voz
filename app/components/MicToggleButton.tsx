import React from 'react';
import { MicIcon, MicOffIcon, VolumeIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';

export interface MicToggleButtonProps {
  isMuted: boolean;
  onToggle: () => void;
  onToggleSpeaker?: () => void;
  isSpeakerMuted?: boolean;
  isUser?: boolean;
  label?: string;
  className?: string;
}

const MicToggleButton: React.FC<MicToggleButtonProps> = ({
  isMuted,
  onToggle,
  onToggleSpeaker,
  isSpeakerMuted = false,
  isUser = true,
  label,
  className = "",
}) => {
  const getButtonClasses = () => {
    const baseClasses = "flex items-center justify-center p-3 rounded-full shadow-md transition-all duration-300";
    const stateClasses = isMuted
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "bg-green-500 hover:bg-green-600 text-white";
    
    return `${baseClasses} ${stateClasses} ${className}`;
  };

  const getIcon = () => {
    if (isUser) {
      return isMuted ? <MicOffIcon size={20} /> : <MicIcon size={20} />;
    } else {
      // Para el control del altavoz
      if (isSpeakerMuted) {
        return <VolumeXIcon size={20} />;
      } else {
        return isMuted ? <VolumeIcon size={20} /> : <Volume2Icon size={20} />;
      }
    }
  };

  const getTooltipText = () => {
    if (isUser) {
      return isMuted ? "Activar micrófono" : "Silenciar micrófono";
    } else {
      return isSpeakerMuted ? "Activar altavoz" : "Silenciar altavoz";
    }
  };

  const handleClick = () => {
    if (isUser || !onToggleSpeaker) {
      onToggle();
    } else {
      onToggleSpeaker();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className={getButtonClasses()}
        aria-label={getTooltipText()}
        title={getTooltipText()}
      >
        {getIcon()}
      </button>
      {label && (
        <span className="text-sm font-medium mt-2 text-amber-900">{label}</span>
      )}
    </div>
  );
};

export default MicToggleButton;