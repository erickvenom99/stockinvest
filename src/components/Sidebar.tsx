"use client"
import { User, Inbox, CreditCard, Bell, Settings, BookLock, Logs } from 'lucide-react';
import UserItem from '@/components/UserItem';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from './ui/command';


const Sidebar = () => {
    const menuList = [
        {
            group: "General",
            items: [
                {
                    link: "/",
                    icon: <User />,
                    text: "profile"
                },
                {
                    link: "/",
                    icon: <Inbox />,
                    text: "Inbox"
                },
                {
                    link: "/",
                    icon: <CreditCard />,
                    text: "Billing"
                },
                {
                    link: "/",
                    icon: <Bell />,
                    text: "Notification"
                },

            ]
        },
        {
            group: "Settings",
            items: [
                {
                    link: "/",
                    icon: <Settings />,
                    text: "General settings"
                },
                {
                    link: "/",
                    icon: <BookLock />,
                    text: "Privacy"
                },
                {
                    link: "/",
                    icon: <Logs />,
                    text: "Logs"
                },

            ]
        }
    ]
  return (
    <div className="fixed flex flex-col gap-4 w-[300px] min-w-[300px] border-r min-h-screen p-4">
        <div>
            <UserItem />
        </div>
        <div className="grow">
        <Command style={{ overflow: 'visible' }}>
             <CommandList style={{ overflow: 'visible' }}>
                {menuList.map((menu: any, key: number) => (
                <CommandGroup key={key} heading={menu.group}>
                    {menu.items.map((option: any, optionKey: number) =>
                    <CommandItem key={optionKey} className="flex gap-2">
                        {option.icon}
                        {option.text}
                    </CommandItem>
                )}
                </CommandGroup>
                ))}
                <CommandSeparator /> 
            </CommandList>
        </Command>
        </div>
        <div>settings/notifcation</div>
    </div>
  )
}

export default Sidebar