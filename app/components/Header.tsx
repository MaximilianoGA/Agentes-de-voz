import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  isListening: boolean;
  toggleListening: () => void;
}

const Header: React.FC<HeaderProps> = ({ isListening, toggleListening }) => {
  return (
    <header className="bg-gradient-to-r from-[#DD4B1A] to-[#FF6B00] text-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Sabores de México
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="hover:text-[#FFF8E1] transition-colors">
            Inicio
          </Link>
          <Link href="/menu" className="hover:text-[#FFF8E1] transition-colors">
            Menú
          </Link>
          <Link href="/about" className="hover:text-[#FFF8E1] transition-colors">
            Nosotros
          </Link>
          <Link href="/contact" className="hover:text-[#FFF8E1] transition-colors">
            Contacto
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-[#8B2D00]/30 transition-colors">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Link>
          
          <Link href="/profile" className="p-2 rounded-full hover:bg-[#8B2D00]/30 transition-colors">
            <span className="text-xl">👤</span>
          </Link>
          
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 