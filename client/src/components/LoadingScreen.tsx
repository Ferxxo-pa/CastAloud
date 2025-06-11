import logoPath from "@assets/Cast aloud logo_1749671969194.png";

interface LoadingScreenProps {
  isVisible: boolean;
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
        <div className="animate-bounce">
          <img 
            src={logoPath}
            alt="Cast Aloud Logo"
            className="w-16 h-16 rounded-xl mx-auto"
          />
        </div>
        <div className="mt-3 text-gray-600 text-xs">
          Loading...
        </div>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}