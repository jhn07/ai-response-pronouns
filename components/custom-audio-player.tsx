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
        "h-8 w-8 text-blue-600 hover:text-blue-800",
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
          <PlayIcon className="h-4 w-4" />
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
    <div className="w-full max-w-md bg-gray-100 rounded-lg shadow-sm">
      <audio ref={audioRef} src={audioUrl} />
      <div className="flex flex-col p-4 gap-4">
        {/* Верхняя панель с кнопками управления и временем */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CustomButton
              isPlaying={isPlaying}
              onClick={togglePlay}
            />
            <CustomButton
              icon={<RotateCwIcon className="h-4 w-4" />}
              onClick={resetAudio}
            />
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Слайдер времени */}
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleTimeChange}
          className="w-full"
        />

        {/* Регулятор громкости */}
        <div className="flex items-center gap-2">
          <Volume2Icon className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};