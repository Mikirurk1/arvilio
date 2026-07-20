import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Intrinsic box for CLS — logos are short wide marks. */
  width?: number;
  height?: number;
  priority?: boolean;
};

/** CMS media logos with reserved dimensions (CLS-safe). */
export function CmsLogo({
  src,
  alt,
  className,
  width = 160,
  height = 44,
  priority = false,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={{ width: 'auto', height: '100%', maxWidth: '100%', objectFit: 'contain' }}
      unoptimized
    />
  );
}
