import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <span className="text-2xl">🐾</span>
              <span>
                FlyMy<span className="text-brand-400">.Pet</span>
              </span>
            </div>
            <p className="text-navy-300 text-sm max-w-sm leading-relaxed">
              Safe and reliable pet relocation from the UAE to Europe. We handle
              documents, vet checks, and flights so your pet travels stress-free.
            </p>
            <p className="text-navy-400 text-xs mt-4">
              A service by Yureka Media
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-navy-200">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-navy-300 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-navy-300 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/rescue"
                  className="text-navy-300 hover:text-white transition-colors"
                >
                  Rescue & Sponsor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-navy-200">
              Routes
            </h3>
            <ul className="space-y-2 text-sm text-navy-300">
              <li>UAE → Spain</li>
              <li>UAE → Portugal</li>
              <li>UAE → Romania</li>
              <li>UAE → Russia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-700 text-center text-xs text-navy-400">
          © {new Date().getFullYear()} FlyMy.Pet — All rights reserved
        </div>
      </div>
    </footer>
  );
}
