export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-32">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-500 tracking-wider">
            © {currentYear} Haerin Blog
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Crafted with passion and code
          </p>
        </div>
      </div>
    </footer>
  )
}
