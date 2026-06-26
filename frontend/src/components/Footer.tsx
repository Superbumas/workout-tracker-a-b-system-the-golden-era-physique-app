import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-border bg-card mt-auto shadow-vintage">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground font-mono">
          © 2025. Built with <Heart className="inline w-4 h-4 text-primary fill-primary" /> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline font-semibold"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

