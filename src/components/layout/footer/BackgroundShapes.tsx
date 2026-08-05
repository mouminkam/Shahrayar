// Removed "use client" - This component only uses static JSX which is SSR-compatible
export default function BackgroundShapes() {
  return (
    <>
      {/* Background Shapes - Images can be added here later */}
      <div className="absolute bottom-0 left-0 w-48 h-64 opacity-10 pointer-events-none hidden 2xl:block">
        <div className="w-full h-full bg-green-500 rounded-tl-full"></div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none hidden 2xl:block">
        <div className="w-full h-full bg-white rounded-tr-full"></div>
      </div>
    </>
  );
}
