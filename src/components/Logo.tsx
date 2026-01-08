import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="https://firebasestorage.googleapis.com/v0/b/connect-auditions.firebasestorage.app/o/logo-transparent-png.png?alt=media&token=7c4a5f7c-f542-49ff-92b4-0288025b42a2"
        alt="Connect Club Logo"
        width={40}
        height={40}
        className="h-10 w-10"
      />
      <h1 className="font-headline text-xl font-bold text-primary">Connect Club-Auditions</h1>
    </div>
  );
}
