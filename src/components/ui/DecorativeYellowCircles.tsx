"use client";

export default function DecorativeYellowCircles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Yellow Circles */}
      {[...Array(8)].map((_, i) => {
        const sizes = [
          { w: "w-16", h: "h-16", opacity: "opacity-20" },
          { w: "w-24", h: "h-24", opacity: "opacity-15" },
          { w: "w-32", h: "h-32", opacity: "opacity-10" },
          { w: "w-20", h: "h-20", opacity: "opacity-18" },
        ];
        const positions = [
          { top: "top-[10%]", left: "left-[5%]", delay: "0s" },
          { top: "top-[20%]", left: "left-[85%]", delay: "0.5s" },
          { top: "top-[40%]", left: "left-[10%]", delay: "1s" },
          { top: "top-[50%]", left: "left-[90%]", delay: "1.5s" },
          { top: "top-[65%]", left: "left-[8%]", delay: "2s" },
          { top: "top-[75%]", left: "left-[88%]", delay: "2.5s" },
          { top: "top-[30%]", left: "left-[50%]", delay: "0.8s" },
          { top: "top-[85%]", left: "left-[45%]", delay: "1.2s" },
        ];

        const size = sizes[i % sizes.length];
        const position = positions[i % positions.length];

        return (
          <div
            key={i}
            className={`absolute ${position.top} ${position.left} ${size.w} ${size.h} ${size.opacity}`}
            style={{
              animation: `float-bob-y 4s ease-in-out infinite, float-bob-x 6s ease-in-out infinite`,
              animationDelay: position.delay,
            }}
          >
            <div className="w-full h-full bg-[#FFBA00] rounded-full blur-sm"></div>
          </div>
        );
      })}

      {/* Smaller sparkle effects */}
      {[...Array(12)].map((_, i) => {
        const positions = [
          { top: "top-[15%]", left: "left-[25%]" },
          { top: "top-[25%]", left: "left-[70%]" },
          { top: "top-[45%]", left: "left-[25%]" },
          { top: "top-[55%]", left: "left-[75%]" },
          { top: "top-[70%]", left: "left-[20%]" },
          { top: "top-[80%]", left: "left-[80%]" },
          { top: "top-[35%]", left: "left-[60%]" },
          { top: "top-[60%]", left: "left-[40%]" },
          { top: "top-[12%]", left: "left-[50%]" },
          { top: "top-[22%]", left: "left-[35%]" },
          { top: "top-[72%]", left: "left-[55%]" },
          { top: "top-[88%]", left: "left-[30%]" },
        ];

        const position = positions[i % positions.length];
        const delay = `${i * 0.3}s`;

        return (
          <div
            key={`sparkle-${i}`}
            className={`absolute ${position.top} ${position.left} w-3 h-3 opacity-30`}
            style={{
              animation: `float-bob-y 3s ease-in-out infinite`,
              animationDelay: delay,
            }}
          >
            <div className="w-full h-full bg-[#FFBA00] rounded-full shadow-lg shadow-[#FFBA00]/50"></div>
          </div>
        );
      })}
    </div>
  );
}
