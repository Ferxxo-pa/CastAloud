import { Link } from "wouter";

export default function HomeSimple() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-center">Cast Aloud</h1>
          <p className="text-gray-600 text-center mt-2">
            Accessibility tools for reading and replying to casts
          </p>
        </header>

        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-lg font-semibold mb-4">Try the Mini App</h2>
          <p className="text-gray-600 mb-4">
            The mini app helps you read casts aloud and create voice replies with AI assistance.
          </p>
          
          <div className="space-y-3">
            <Link href="/cast-aloud?text=Hello%20world!%20This%20is%20a%20sample%20cast%20about%20the%20future%20of%20decentralized%20social%20networks.">
              <button className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-medium">
                Read Cast Aloud
              </button>
            </Link>
            
            <Link href="/cast-aloud?text=Just%20published%20my%20thoughts%20on%20web3%20accessibility.%20Making%20technology%20inclusive%20for%20everyone%20should%20be%20our%20top%20priority.">
              <button className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-center font-medium">
                Write AI-Assisted Reply
              </button>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. 📝 Paste a Farcaster post URL or text directly</li>
              <li>2. 🔊 Click "Read Aloud" to hear the content</li>
              <li>3. ✍️ Type your reply in the text area</li>
              <li>4. 🤖 Get AI feedback or polish your reply</li>
              <li>5. 📋 Copy the improved reply to post on Farcaster</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}