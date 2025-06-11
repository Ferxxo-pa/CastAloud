import logoPath from "@assets/Cast aloud logo_1749671969194.png";

interface LoadingScreenProps {
  isVisible: boolean;
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-bounce">
          <img 
            src={logoPath}
            alt="Cast Aloud Logo"
            className="w-24 h-24 rounded-2xl shadow-lg mx-auto"
          />
        </div>
        <div className="mt-4 text-gray-600 text-sm">
          Loading Cast Aloud...
        </div>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}