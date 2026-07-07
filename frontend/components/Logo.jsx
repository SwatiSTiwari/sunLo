import Image from "next/image";

export default function Logo({ className = "" }) {
  return (
    <Image
      src="/image/image.png"
      alt="SunLo"
      width={120}
      height={40}
      className={`h-8 w-auto object-contain ${className}`}
      priority
    />
  );
}
