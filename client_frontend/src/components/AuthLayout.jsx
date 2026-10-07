export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 relative bg-teal-600 overflow-hidden flex-col justify-between p-10 text-white">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-teal-500/40" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-emerald-400/30 translate-x-1/3 translate-y-1/3" />

        <span className="relative text-xl font-semibold tracking-tight">
          ShopKart
        </span>

        <div className="relative">
          <h2 className="text-3xl font-semibold leading-snug mb-3">
            Simple shopping,
            <br />
            sorted.
          </h2>
          <p className="text-teal-50/80 text-sm max-w-xs">
            One account for a faster checkout, saved details, and order
            history whenever you need it.
          </p>
        </div>

        <p className="relative text-xs text-teal-50/60">
          &copy; {new Date().getFullYear()} ShopKart
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-xl font-semibold text-teal-600 tracking-tight">
              ShopKart
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mb-8">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
