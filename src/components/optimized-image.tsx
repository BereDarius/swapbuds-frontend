import { cn } from "@/lib/utils";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
}: OptimizedImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        quality={85}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={cn("object-cover", className)}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      quality={85}
    />
  );
}
