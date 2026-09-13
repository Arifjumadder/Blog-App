import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-2">
        <span className="font-bold text-brand-600 dark:text-brand-400">Blog App</span>
        <span className="text-sm text-slate-400 dark:text-slate-500">
          · Made with ❤️ and <b className="text-slate-500 dark:text-slate-400">React.js</b>
        </span>
      </div>
    </footer>
  )
}

export default Footer
