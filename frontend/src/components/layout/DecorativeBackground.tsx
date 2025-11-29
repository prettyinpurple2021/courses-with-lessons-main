const sparkles = [
  { pos: 'top-[10%] left-[15%]', delay: '[animation-delay:0s]', scale: 'scale-100' },
  { pos: 'top-[80%] left-[5%]', delay: '[animation-delay:1s]', scale: 'scale-[0.7]' },
  { pos: 'top-[5%] left-[90%]', delay: '[animation-delay:0.5s]', scale: 'scale-[1.2]' },
  { pos: 'top-[90%] left-[95%]', delay: '[animation-delay:1.5s]', scale: 'scale-100' },
];

const orbs = [
  { pos: 'top-[15%] right-[10%]', size: 'w-[60px] h-[60px]', delay: '[animation-delay:0s]' },
  { pos: 'bottom-[5%] left-[8%]', size: 'w-[40px] h-[40px]', delay: '[animation-delay:-3s]' },
  { pos: 'bottom-[15%] right-[20%]', size: 'w-[25px] h-[25px]', delay: '[animation-delay:-1s]' },
];

const radialBackgroundGradient =
  '[background-image:radial-gradient(at_8%_15%,hsla(328,100%,54%,0.25)_0px,transparent_40%),radial-gradient(at_95%_25%,hsla(0,0%,0%,0.6)_0px,transparent_50%),radial-gradient(at_70%_98%,hsla(210,9%,44%,0.3)_0px,transparent_50%),radial-gradient(at_15%_88%,hsla(0,0%,0%,0.6)_0px,transparent_40%),radial-gradient(at_50%_50%,hsla(328,100%,54%,0.15)_0px,transparent_50%)]';

const noiseBg =
  '[background-image:url(\'data:image/svg+xml,%3Csvg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E\')]';

const orbBg =
  '[background:radial-gradient(circle,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_60%),conic-gradient(from_180deg_at_50%_50%,#00FFFF_0deg,#FF00FF_120deg,#FFFF00_240deg,#00FFFF_360deg)]';

const DecorativeBackground = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    <div aria-hidden className={`absolute inset-0 opacity-60 ${radialBackgroundGradient}`} />
    <div aria-hidden className={`absolute inset-0 [opacity:0.05] ${noiseBg}`} />

    {sparkles.map((item, index) => (
      <div
        key={`sparkle-${index}`}
        aria-hidden
        className={`absolute animate-pulse ${item.pos} ${item.delay} ${item.scale}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.849 8.151L20 10L13.849 11.849L12 18L10.151 11.849L4 10L10.151 8.151L12 2Z" fill="white" fillOpacity="0.8" />
        </svg>
      </div>
    ))}

    {orbs.map((item, index) => (
      <div
        key={`orb-${index}`}
        aria-hidden
        className={`absolute rounded-full animate-pulse ${item.pos} ${item.size} ${item.delay} ${orbBg} blur-[6px]`}
      />
    ))}
  </div>
);

export default DecorativeBackground;
