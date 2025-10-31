import React from 'react'
import { useState } from 'react'
import { DataProvider } from './Contexts/DataContext'
import Dashboard from './components/Dashboard'

export default function App() {

  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#00254A] border-b border-gray-500 shadow-sm fixed top-0 w-full max-h-[10vh]">
          <div className="max-w-7xl mx-auto px-4 py-2 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Energy Tracker</h1>
                  <p className="text-sm text-white">Real-time Dashboard</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="relative cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 group"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <svg
                    className={`w-5 h-5 text-white transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'} absolute`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <svg
                    className={`w-5 h-5 text-white transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'} absolute`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </button>

                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white">Live</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 mt-[10vh]">
          <Dashboard isDarkMode={isDark} />
        </main>

        <footer className="bg-[#00254A] border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p className='text-white'>&copy; 2024 Energy Tracker. Monitor your energy consumption efficiently.</p>
              <div className="flex items-center space-x-4 text-white">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DataProvider>
  )
}