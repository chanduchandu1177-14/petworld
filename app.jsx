// ============================================================
//  DogSnap — App.jsx
//  No-build React 18 + Tailwind. Babel compiles JSX in-browser.
// ============================================================

const { useState, useEffect, useRef } = React;

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_DOGS = [
  {
    id: 1,
    name: "Biscuit",
    handle: "@biscuit_boi",
    avatar: "https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg",
    image:  "https://images.dog.ceo/breeds/retriever-golden/n02099601_7771.jpg",
    likes: 342,
    seen: false,
  },
  {
    id: 2,
    name: "Luna",
    handle: "@lunathelab",
    avatar: "https://images.dog.ceo/breeds/labrador/n02099712_4323.jpg",
    image:  "https://images.dog.ceo/breeds/labrador/n02099712_7003.jpg",
    likes: 891,
    seen: false,
  },
  {
    id: 3,
    name: "Pretzel",
    handle: "@pretzel_pup",
    avatar: "https://images.dog.ceo/breeds/dachshund/dachshund-8.jpg",
    image:  "https://images.dog.ceo/breeds/dachshund/dachshund-2.jpg",
    likes: 217,
    seen: false,
  },
  {
    id: 4,
    name: "Mochi",
    handle: "@mochi.shiba",
    avatar: "https://images.dog.ceo/breeds/shiba/shiba-13.jpg",
    image:  "https://images.dog.ceo/breeds/shiba/shiba-5.jpg",
    likes: 1504,
    seen: false,
  },
];

// ── Inline SVG Icon Components ────────────────────────────────

const HeartIcon = ({ filled, size = 28 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "white"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ReplyIcon = ({ size = 26 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CameraIcon = ({ size = 26 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CloseIcon = ({ size = 24 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Image Compression Utility ─────────────────────────────────
/**
 * Compresses an uploaded image using the Canvas API.
 * Resizes to max 1080px wide and converts to WebP.
 * Call this before uploading to Cloudflare R2.
 */
async function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const MAX_WIDTH = 1080;
      const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          // ── TODO: Upload `blob` to Cloudflare R2 via a signed URL ──
          // const formData = new FormData();
          // formData.append("file", blob, "status.webp");
          // await fetch(CLOUDFLARE_R2_UPLOAD_URL, { method: "PUT", body: blob });
          resolve(blob);
        },
        "image/webp",
        0.82  // quality
      );
    };

    img.onerror = reject;
    img.src = objectUrl;
  });
}

// ── Progress Bar (mock countdown for 24-hour story) ───────────
const ProgressBar = ({ duration = 5000, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
      else onComplete && onComplete();
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className="w-full h-0.5 bg-white/30 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// ── Status Viewer (full-screen overlay) ───────────────────────
const StatusViewer = ({ dog, liked, likeCount, onLike, onClose }) => {
  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={handleBackdrop}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 px-3 pt-3 z-10">
        <ProgressBar duration={7000} onComplete={onClose} />
      </div>

      {/* Top bar: name + close */}
      <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-4 z-10 mt-2">
        <div className="flex items-center gap-3">
          <img
            src={dog.avatar}
            alt={dog.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-white"
          />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{dog.name}</p>
            <p className="text-white/60 text-xs">{dog.handle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      {/* Full-size image */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src={dog.image}
          alt={dog.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 pb-10 pt-4">
        {/* Reply input mock */}
        <div className="flex-1 mr-4 bg-white/10 border border-white/20 rounded-full px-4 py-2.5">
          <p className="text-white/50 text-sm">Send a reply...</p>
        </div>

        {/* Like button */}
        <button
          onClick={onLike}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <HeartIcon filled={liked} size={30} />
          <span className={`text-xs font-semibold ${liked ? "text-red-400" : "text-white"}`}>
            {likeCount.toLocaleString()}
          </span>
        </button>

        {/* Reply icon button */}
        <button className="ml-4 active:scale-90 transition-transform">
          <ReplyIcon size={28} />
        </button>
      </div>
    </div>
  );
};

// ── Story Circle ───────────────────────────────────────────────
const StoryCircle = ({ dog, seen, onClick }) => {
  const gradient = seen
    ? "p-0.5 bg-white/20 rounded-full"
    : "p-0.5 rounded-full"

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
    >
      <div
        className="p-0.5 rounded-full"
        style={
          seen
            ? { background: "rgba(255,255,255,0.2)" }
            : {
                background:
                  "linear-gradient(135deg, #f97316, #ec4899, #a855f7)",
              }
        }
      >
        <div className="bg-black p-0.5 rounded-full">
          <img
            src={dog.avatar}
            alt={dog.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>
      </div>
      <span className="text-white/80 text-xs font-medium truncate w-20 text-center">
        {dog.name}
      </span>
    </button>
  );
};

// ── Feed Card (scrollable main content) ───────────────────────
const FeedCard = ({ dog, liked, likeCount, onLike, onOpen }) => (
  <div className="bg-zinc-900 rounded-2xl overflow-hidden mb-4 mx-4">
    <button className="w-full" onClick={onOpen}>
      <img
        src={dog.image}
        alt={dog.name}
        className="w-full h-72 object-cover"
      />
    </button>
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <img src={dog.avatar} alt={dog.name} className="w-8 h-8 rounded-full object-cover" />
        <div>
          <p className="text-white font-semibold text-sm">{dog.name}</p>
          <p className="text-white/40 text-xs">{dog.handle}</p>
        </div>
      </div>
      <button
        onClick={onLike}
        className="flex items-center gap-1.5 active:scale-90 transition-transform"
      >
        <HeartIcon filled={liked} size={22} />
        <span className={`text-sm font-semibold ${liked ? "text-red-400" : "text-white/70"}`}>
          {likeCount.toLocaleString()}
        </span>
      </button>
    </div>
  </div>
);

// ── Header ─────────────────────────────────────────────────────
const Header = ({ onCameraClick }) => (
  <header className="flex items-center justify-between px-5 py-4 border-b border-white/5">
    <h1
      className="text-white text-2xl font-black tracking-tight"
      style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}
    >
      Dog<span className="text-orange-400">Snap</span>
    </h1>
    <button
      onClick={onCameraClick}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/8 border border-white/10 active:bg-white/15 transition-colors"
    >
      <CameraIcon size={22} />
    </button>
  </header>
);

// ── Hidden file input for camera upload ───────────────────────
const CameraUpload = ({ inputRef }) => (
  <input
    ref={inputRef}
    type="file"
    accept="image/*"
    capture="environment"
    className="hidden"
    onChange={handleUpload}
  />
);

// ── Root App ───────────────────────────────────────────────────
export default function App() {
  const [dogs, setDogs]           = useState(INITIAL_DOGS);
  const [viewingStatus, setViewingStatus] = useState(null); // null | dog object
  const [likes, setLikes]         = useState(() =>
    Object.fromEntries(INITIAL_DOGS.map((d) => [d.id, { count: d.likes, liked: false }]))
  );
  const [seenIds, setSeenIds]     = useState(new Set());
  const cameraInputRef            = useRef(null);

  // Open a story
  const openStatus = (dog) => {
    setViewingStatus(dog);
    setSeenIds((prev) => new Set([...prev, dog.id]));
  };

  // Optimistic like handler
  const handleLike = (dogId) => {
    setLikes((prev) => {
      const current = prev[dogId];
      if (current.liked) return prev; // prevent un-liking for now

      const updated = {
        ...prev,
        [dogId]: { count: current.count + 1, liked: true },
      };

      // ── TODO: Fire-and-forget to Cloudflare Worker ──────────────
      // fetch("https://your-worker.your-subdomain.workers.dev/api/like", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ dogId, delta: 1 }),
      // });
      // ────────────────────────────────────────────────────────────

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white max-w-md mx-auto relative">
      <Header onCameraClick={() => cameraInputRef.current?.click()} />
      <CameraUpload inputRef={cameraInputRef} />

      {/* Story / Status Bar */}
      <section className="py-4 px-3">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {/* "Add Story" placeholder */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-dashed border-white/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="text-white/40 text-xs">Your snap</span>
          </div>

          {dogs.map((dog) => (
            <StoryCircle
              key={dog.id}
              dog={dog}
              seen={seenIds.has(dog.id)}
              onClick={() => openStatus(dog)}
            />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-4 border-t border-white/5 mb-4" />

      {/* Feed */}
      <section className="pb-24">
        {dogs.map((dog) => (
          <FeedCard
            key={dog.id}
            dog={dog}
            liked={likes[dog.id].liked}
            likeCount={likes[dog.id].count}
            onLike={() => handleLike(dog.id)}
            onOpen={() => openStatus(dog)}
          />
        ))}
      </section>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/80 backdrop-blur border-t border-white/10 flex justify-around items-center py-3 px-6 z-40">
        {/* Home */}
        <button className="flex flex-col items-center gap-0.5 opacity-100">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/></svg>
          <span className="text-white text-xs">Home</span>
        </button>
        {/* Search */}
        <button className="flex flex-col items-center gap-0.5 opacity-40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span className="text-white/40 text-xs">Explore</span>
        </button>
        {/* Camera center button */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform -mt-5"
        >
          <CameraIcon size={22} />
        </button>
        {/* Notifications */}
        <button className="flex flex-col items-center gap-0.5 opacity-40">
          <HeartIcon filled={false} size={22} />
          <span className="text-white/40 text-xs">Likes</span>
        </button>
        {/* Profile */}
        <button className="flex flex-col items-center gap-0.5 opacity-40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span className="text-white/40 text-xs">Profile</span>
        </button>
      </nav>

      {/* Status Viewer overlay */}
      {viewingStatus && (
        <StatusViewer
          dog={viewingStatus}
          liked={likes[viewingStatus.id].liked}
          likeCount={likes[viewingStatus.id].count}
          onLike={() => handleLike(viewingStatus.id)}
          onClose={() => setViewingStatus(null)}
        />
      )}
    </div>
  );
}