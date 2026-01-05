import { Twitter, BookOpen, Github, Mail, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-gray-900">MOSSLAND</p>
            <p className="text-xs text-gray-500 mt-1">
              We are building the Invisible Bridge.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://moss.land"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-moss-600 transition-colors"
              aria-label="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/TheMossland"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-moss-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://medium.com/mossland-blog"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-moss-600 transition-colors"
              aria-label="Medium"
            >
              <BookOpen className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/mossland"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-moss-600 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="mailto:contact@moss.land"
              className="p-1.5 text-gray-400 hover:text-moss-600 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 text-center md:text-right">
            &copy; 2025, 2026 MOSSLAND
          </p>
        </div>
      </div>
    </footer>
  );
}
