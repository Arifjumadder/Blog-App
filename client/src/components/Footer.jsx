import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-2">
        <span className="font-bold text-brand-600">Blog App</span>
        <span className="text-sm text-gray-400">
          · Made with ❤️ and <b className="text-gray-500">React.js</b>
        </span>
      </div>
    </footer>
  )
}

export default Footer
