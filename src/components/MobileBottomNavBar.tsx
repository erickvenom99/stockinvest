'use client';

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Utility for conditional class names
import { sideBarEntries, SideBarEntry} from "@/components/ui/sidebar-data"; // Your menu data

interface MobileNavBarProps {
  className?: string;
}

export default function MobileBottomNavBar({ className}: MobileNavBarProps) {
  // Track which dropdown (if any) is open by its title.
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (title: string) => {
    setOpenDropdown((prev) => (prev === title ? null : title));
  };

  // Type guard: We narrow the found entry to one of type "group"
  const openDropdownItem = sideBarEntries.find(
    (item): item is Extract<SideBarEntry, { type: "group" }> =>
      item.title === openDropdown && item.type === "group"
  );

  return (
      <>
        {/* Bottom Navigation Bar */}
        <div className={cn("fixed bottom-0 left-0 right-0 z-30 bg-background border-t",
          className
        )}>
          <div className="flex justify-around items-center p-2 safe-bottom">
            {sideBarEntries.map((item) => {
              const Icon = item.icon as React.ElementType<{ className?: string}>;
              return item.type === "link" ? (
                  <Link 
                    key={item.title} 
                    href={item.url}
                    className="p-3 rounded-full hover:bg-accent transition-colors"
                  >
                      {Icon && <Icon className='w-6 h-6' />}
                  </Link>) : (
                    // For dropdown-type items, render a button that toggles the dropdown
                    <button
                      key={item.title}
                      onClick={() => handleDropdownToggle(item.title)}
                      className={cn(
                        'p-3 rounded-full hover:bg-accent transition-colors',
                        openDropdown === item.title && 'bg-accent'
                      )}
                    >
                      {Icon && <Icon className='w-6 h-6' />}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Dropdown Panel */}
        <div
          className={cn(
            "fixed left-0 right-0 bg-background border-t z-30 transition-transform duration-300",
            "bottom-[var(--nav-height)] shadow-lg", // positions the panel above the navbar
            openDropdown ? "translate-y-0" : "translate-y-[calc(100%+var(--nav-height))]"
          )}
          style={ {'--nav-height': 'calc(56px + env(safe-area-inset-bottom))'} as React.CSSProperties} 
        >
          <div className='p-2 grid grid-cols-2 gap-2'>
          {openDropdownItem?.children.map((child) => {
            const ChildIcon = child.icon as React.ElementType<{ className?: string}>

            return (
              <Link 
                key={child.title} 
                href={child.url}
                className="flex flex-col items-center rounded-lg gap-2 p-3 hover:bg-accent transition-colors"
              >
                {ChildIcon && <ChildIcon className='w-5 h-5 mb-1' />}
                <span className='text-xs text-center'>{child.title}</span>
              </Link>
            );
          }
        )}
        </div>
      </div>
    </>
  );
}
