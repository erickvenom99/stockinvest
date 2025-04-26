import {
  Home,
  PieChart,
  BarChart2,
  List,
//   ShoppingCart,
  CreditCard,
  TrendingUp,
  Settings,
  User,
  Shield,
  Sliders,
  LifeBuoy,
} from "lucide-react";

export type SideBarEntry = 
| {
    type: "link";
    title: string;
    url: string;
    icon: React.ComponentType;
}

| {
    type: "group";
    title: string;
    icon?: React.ComponentType;
    children: {
        title: string;
        url: string;
        icon: React.ComponentType;
    }[];
};

export const sideBarEntries: SideBarEntry[] = [
    {
        type: "link",
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        type: "group",
        title: "Portfolio",
        icon: PieChart,
        children: [
            {
                title: "Overview",
                url: "/portfolio/overview",
                icon: BarChart2,
            },
            {
                title: "Holdings",
                url: "/portfolio/holdings",
                icon: List
            },
            {
                title: "Performance",
                url: "/portfolio/performance",
                icon: TrendingUp,
            },
        ],
    },
    {
        type: "link",
        title: "Watchlist",
        url: "/watchlist",
        icon: List,
    },
    {
        type: "group",
        title: "Wallet",
        icon: CreditCard,
        children: [
            {
                title: "All Transactions",
                url: "/wallet/overview",
                icon: List,
            },
            {
                title: "Deposits",
                url: "/wallet/deposits",
                icon: CreditCard,
            },
            {
                title: "Withdrawals",
                url: "//wallet/withdrawals",
                icon: CreditCard,
            }
        ]
    },
    {
        type: "group",
        title: "Settings",
        icon: Settings,
        children: [
            {
                title: "Account",
                url: "/settings/account",
                icon: User,
            },
            {
                title: "Security",
                url: "/settings/security",
                icon: Shield,
            },
            {
                title: "Preferences",
                url: "/settings/preferences",
                icon: Sliders,
            },
        ],
    },

    {
        type: "link",
        title: "Support",
        url: "/support",
        icon: LifeBuoy
    }
]

export type SideBarChildEntry = {
    title: string;
    url: string;
    icon: React.ComponentType;
}