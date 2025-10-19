import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authBg = PlaceHolderImages.find(img => img.id === 'auth-bg');

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-4">
      {authBg && (
        <Image
          src={authBg.imageUrl}
          alt={authBg.description}
          data-ai-hint={authBg.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-background/20 to-accent/70 dark:from-primary/50 dark:via-background/10 dark:to-accent/50" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
