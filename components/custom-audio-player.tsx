import { useEffect, useRef, useState } from "react";
import { Button, ButtonProps } from "./ui/button";
import { Slider } from "./ui/slider";
import { PlayIcon, PauseIcon, RotateCwIcon, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";


const CustomButton = ({
  isPlaying,
  onClick,
  className,
  icon: Icon,
  ...props
}: ButtonProps & { isPlaying?: boolean, icon?: React.ReactNode }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "flex items-center justify-center hover:scale-105 transition-all duration-200",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {Icon ? (
        Icon
      ) : (
        isPlaying ? (
          <PauseIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4 ml-0.5" />
        )
      )}
    </Button>
  )
}


interface CustomAudioPlayerProps {
  audioUrl: string;
}

export const CustomAudioPlayer = ({ audioUrl }: CustomAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeChange = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0];
      setVolume(newVolume[0]);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100">
      <audio ref={audioRef} src={audioUrl} />
      <div className="flex flex-col p-6 gap-6">
        
        {/* Главный прогресс-бар */}
        <div className="space-y-3">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleTimeChange}
            className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-500 [&>span:first-child]:to-indigo-500 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:shadow-lg"
          />
          <div className="flex items-center justify-between text-sm text-gray-500 px-1">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        {/* Панель управления */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton
            icon={<RotateCwIcon className="h-5 w-5" />}
            onClick={resetAudio}
            className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200"
          />
          
          <CustomButton
            isPlaying={isPlaying}
            onClick={togglePlay}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 [&_svg]:w-6 [&_svg]:h-6"
          />
          
          {/* Регулятор громкости */}
          <div className="flex items-center gap-3 w-20">
            <Volume2Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};