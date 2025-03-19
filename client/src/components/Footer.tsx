"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Direct mapping of routes to icons
const icons = {
    '/home': '/assets/icons/home.png',
    '/explore': '/assets/icons/explore.png',
    '/chat': '/assets/icons/chat.png',
    '/journal': '/assets/icons/notebook.png',
    '/music': '/assets/icons/music.png',
    '/community': '/assets/icons/profile.png'
};

const NavbarItem = ({ href, isActive, label }) => {
    const iconSize = 24;

    return (
        <Link
            href={href}
            className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all",
                isActive
                    ? "bg-blue-100 text-blue-600 border border-blue-300"
                    : "text-gray-500 hover:bg-gray-50"
            )}
        >
            <div className="flex items-center justify-center">
                <Image
                    src={icons[href] || '/assets/icons/home.png'} // Fallback to home icon if not found
                    alt={label || href.replace('/', '') || 'home'}
                    width={iconSize}
                    height={iconSize}
                    className={isActive ? "opacity-100" : "opacity-70"}
                    priority
                />
            </div>
            <span className={cn(
                "text-xs mt-1",
                isActive ? "font-medium" : ""
            )}>
                {label}
            </span>
        </Link>
    );
};

export function Footer() {
    // Get the current path from the URL
    const pathname = usePathname();
    const getBasePath = (path) => {
        if (path === '/') return '/';

        const segment = '/' + path.split('/')[1];
        return segment;
    };

    const currentPath = getBasePath(pathname);

    const navItems = [
        { href: '/home', label: 'Home' },
        { href: '/explore', label: 'Explore' },
        { href: '/chat', label: 'Chat' },
        { href: '/journal', label: 'Journal' },
        { href: '/music', label: 'Music' },
        { href: '/community', label: 'Community' }
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-20">
            <div className="pb-safe">
                <nav className="flex justify-around px-3 py-2 gap-1">
                    {navItems.map((item) => {
                        const isActive =
                            (item.href === '/' && (currentPath === '/' || currentPath === '/home')) ||
                            (item.href === currentPath);

                        return (
                            <NavbarItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                isActive={isActive}
                            />
                        );
                    })}
                </nav>
            </div>
        </footer>
    );
}

export default Footer;